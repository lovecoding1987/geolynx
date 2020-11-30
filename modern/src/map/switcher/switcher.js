import mapboxgl from 'mapbox-gl';
import config from '../../config'
import { addFireLayers, removeFireLayers } from '../FireLayers';

export class SwitcherControl {

  constructor(styles, defaultStyle, beforeSwitch, afterSwitch) {
    this.styles = styles;
    this.defaultStyle = defaultStyle;
    this.beforeSwitch = beforeSwitch;
    this.afterSwitch = afterSwitch;
    this.onDocumentClick = this.onDocumentClick.bind(this);
  }

  getDefaultPosition() {
    return 'top-right';
  }

  onAdd(mapView) {
    const me = this;
    const map = mapView.mapboxMap;

    me.controlContainer = document.createElement('div');
    me.controlContainer.classList.add('mapboxgl-ctrl');
    me.controlContainer.classList.add('mapboxgl-ctrl-group');
    me.controlContainer.classList.add('mapboxgl-ctrl-top-right');
    me.controlContainer.style.zIndex = 400;

    me.mapStyleContainer = document.createElement('div');
    me.mapStyleContainer.id = 'map-style-container';
    me.mapStyleContainer.classList.add('mapboxgl-style-list');
    me.controlContainer.appendChild(me.mapStyleContainer);

    me.styleButton = document.createElement('button');
    me.styleButton.type = 'button';
    me.styleButton.classList.add('mapboxgl-ctrl-icon');
    me.styleButton.classList.add('mapboxgl-style-switcher');
    me.styleButton.addEventListener('click', () => {
      me.styleButton.style.display = 'none';
      me.mapStyleContainer.style.display = 'block';
    });

    const addStyleItemButton = (style, indent) => {
      const container = document.createElement('button');
      container.type = 'button';
      container.innerText = style.title;
      container.classList.add(style.id);
      if (indent) container.classList.add('indent');
      container.dataset.uri = JSON.stringify(style.uri);
      container.dataset.id = style.id;

      container.addEventListener('click', event => {
        const styleId = event.target.dataset.id;
        if (!styleId) return; // If parent menu then just return;


        const previousZoom = mapView.getZoom();
        const previousCenter = mapView.getCenter();

        me.beforeSwitch(styleId);

        const srcElement = event.srcElement;
        if (srcElement.classList.contains('active')) {
          return;
        }

        if (styleId === 'mapWinds' || styleId === 'mapTemperatures') {
          // Windy map
          document.getElementById('windy').style.visibility = 'visible';
          document.getElementById('mapbox').style.visibility = 'hidden';

          document.dispatchEvent(new CustomEvent('changeMapStyle', {
            detail: {
              styleId: styleId,
              zoom: previousZoom,
              center: previousCenter
            }
          }));
        } else {
          // Mapbox map
          document.getElementById('windy').style.visibility = 'hidden';
          document.getElementById('mapbox').style.visibility = 'visible';

          mapboxgl.accessToken = config.MAPBOX_ACCESS_TOKEN;
          mapView.map.setStyle(JSON.parse(srcElement.dataset.uri));

          mapView.map.setCenter([previousCenter.lng, previousCenter.lat]);
          mapView.map.setZoom(previousZoom);
        }
        me.afterSwitch();
        me.mapStyleContainer.style.display = 'none';
        me.styleButton.style.display = 'block';

        const elms = me.mapStyleContainer.getElementsByClassName('active');
        while (elms[0]) {
          elms[0].classList.remove('active');
        }
        srcElement.classList.add('active');

        if (styleId !== 'mapFIRMS') {
          const checkboxes = me.mapStyleContainer.getElementsByTagName('input');
          for (const checkbox of checkboxes) {
            checkbox.checked = false;
          }
        }
      });

      if (style.id === me.defaultStyle) {
        container.classList.add('active');
      }
      me.mapStyleContainer.appendChild(container);

      return container;
    }

    const addStyleItemWithCheckboxes = (style) => {
      const container = document.createElement('button');
      container.type = 'button';
      container.innerText = style.title;
      container.classList.add(style.id);

      const checkboxesSpan = document.createElement('span');
      checkboxesSpan.style.float = 'right';
      checkboxesSpan.style.marginLeft = '5px';

      for (const c of style.checkboxes) {
        const checkboxSpan = document.createElement('span');

        const checkbox = document.createElement('input');
        checkbox.classList.add(c.id);
        checkbox.type = 'checkbox';
        checkbox.innerText = c.title;
        checkbox.dataset.id = c.id;
        checkboxSpan.appendChild(checkbox);

        const label = document.createElement('label');
        label.for = c.id;
        label.innerText = c.title;
        checkboxSpan.appendChild(label);

        checkboxesSpan.appendChild(checkboxSpan);

        checkbox.addEventListener('change', event => {
          if (me.mapStyleContainer.getElementsByClassName('active')[0].dataset.id !== 'mapFIRMS') {
            me.mapStyleContainer.getElementsByClassName('mapFIRMS')[0].dispatchEvent(new Event('click'));
          }

          const sources = (id) => {
            let srcs = [];

            switch (id) {
              case 'mapFIRMS-24hrs':
                srcs = ['mapModis-24hrs', 'mapVIIRS-S-NPP-24hrs', 'mapVIIRS-NOAA-20-24hrs'];
                break;
              case 'mapFIRMS-48hrs':
                srcs = ['mapModis-48hrs', 'mapVIIRS-S-NPP-48hrs', 'mapVIIRS-NOAA-20-48hrs'];
                break;
              case 'mapFIRMS-7days':
                srcs = ['mapModis-7days', 'mapVIIRS-S-NPP-7days', 'mapVIIRS-NOAA-20-7days'];
                break;
              default:
            }

            return srcs
          }

          for (const checkbox of event.target.parentNode.parentNode.parentNode.getElementsByTagName('input')) {
            if (checkbox !== event.target) {
              checkbox.checked = false;
              sources(checkbox.dataset.id).forEach(source => removeFireLayers(source, map));
            }
          }

          if (event.target.checked) {
            sources(event.target.dataset.id).forEach(source => addFireLayers(source, map, event.target.dataset.id));
          } else {
            sources(event.target.dataset.id).forEach(source => removeFireLayers(source, map));
          }
          me.mapStyleContainer.style.display = 'none';
          me.styleButton.style.display = 'block';
        });
      }
      container.appendChild(checkboxesSpan);

      me.mapStyleContainer.appendChild(container);
    }

    for (const style of me.styles) {
      if (style.checkboxes) {
        addStyleItemWithCheckboxes(style);
      } else {
        addStyleItemButton(style);
      }
    }
    me.controlContainer.appendChild(me.styleButton);

    document.addEventListener('click', me.onDocumentClick);
    return me.controlContainer;
  }

  onRemove() {
    if (!this.controlContainer || !this.controlContainer.parentNode || !this.map || !this.styleButton) {
      return;
    }
    this.styleButton.removeEventListener('click', this.onDocumentClick);
    this.controlContainer.parentNode.removeChild(this.controlContainer);
    document.removeEventListener('click', this.onDocumentClick);
  }

  onDocumentClick(event) {
    if (this.controlContainer && !this.controlContainer.contains(event.target) && this.mapStyleContainer && this.styleButton) {
      this.mapStyleContainer.style.display = 'none';
      this.styleButton.style.display = 'block';
    }
  }
}
