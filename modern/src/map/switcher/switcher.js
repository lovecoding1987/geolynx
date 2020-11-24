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
    me.controlContainer.style.zIndex = 50000;

    me.mapStyleContainer = document.createElement('div');
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
      const styleElement = document.createElement('button');
      styleElement.type = 'button';
      styleElement.innerText = style.title;
      styleElement.classList.add(style.id);
      if (indent) styleElement.classList.add('indent');
      styleElement.dataset.uri = JSON.stringify(style.uri);
      styleElement.dataset.id = style.id;

      styleElement.addEventListener('click', event => {
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
        //me.mapStyleContainer.style.display = 'none';
        //me.styleButton.style.display = 'block';

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
        styleElement.classList.add('active');
      }
      me.mapStyleContainer.appendChild(styleElement);
    }

    const addStyleItemWithCheckboxes = (style, indent) => {
      const container = document.createElement('button');
      container.classList.add(style.title.replace(/[^a-z0-9-]/gi, '_'));
      if (indent) container.classList.add('indent');

      const styleImg = document.createElement('img');
      styleImg.src = style.img;
      styleImg.style.width = '16px';
      styleImg.style.verticalAlign = 'bottom';
      styleImg.style.marginRight = '5px';
      container.appendChild(styleImg);

      const titleSpan = document.createElement('span');
      titleSpan.innerText = style.title;
      container.appendChild(titleSpan);

      const checkboxesSpan = document.createElement('span');
      checkboxesSpan.style.float = 'right';
      checkboxesSpan.style.marginLeft = '5px';

      for (const s of style.items) {
        const checkboxSpan = document.createElement('span');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        checkbox.dataset.id = s.id;
        checkbox.innerText = s.title;
        checkboxSpan.appendChild(checkbox);

        const label = document.createElement('label');
        label.for = s.id;
        label.innerText = s.title;
        checkboxSpan.appendChild(label);

        checkboxesSpan.appendChild(checkboxSpan);

        checkbox.addEventListener('change', event => {
          if (me.mapStyleContainer.getElementsByClassName('active')[0].dataset.id !== 'mapFIRMS') {
            me.mapStyleContainer.getElementsByClassName('mapFIRMS')[0].dispatchEvent(new Event('click'));
          }

          const source = event.target.dataset.id;

          for (const checkbox of event.target.parentNode.parentNode.parentNode.getElementsByTagName('input')) {
            if (checkbox !== event.target) {
              checkbox.checked = false;
              removeFireLayers(checkbox.dataset.id, map)
            }
          }

          if (event.target.checked) {
            addFireLayers(source, map, style.title);
          } else {
            removeFireLayers(source, map)
          }
        });
      }
      container.appendChild(checkboxesSpan);

      me.mapStyleContainer.appendChild(container);
    }

    for (const style of me.styles) {
      addStyleItemButton(style);

      if (style.items) {
        for (const s of style.items) {
          if (s.checkboxes) {
            addStyleItemWithCheckboxes(s, true);
          } else {
            addStyleItemButton(s, true);
          }
        }
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
