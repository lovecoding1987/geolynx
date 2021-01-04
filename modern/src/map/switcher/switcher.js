import mapboxgl from 'mapbox-gl';
import './switcher.css';
import config from '../../config';
import countries from '../../common/countries';
import t from '../../common/localization';


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

        const oldMapProvider = mapView.mapProvider;

        me.beforeSwitch(styleId);

        const srcElement = event.srcElement;
        if (srcElement.classList.contains('active')) {
          return;
        }

        if (styleId === 'mapWinds' || styleId === 'mapTemperatures' || styleId === 'mapRainThunder') {
          // Windy map
          document.getElementById('windy').style.visibility = 'visible';
          document.getElementById('mapbox').style.visibility = 'hidden';
          document.getElementById('google').style.visibility = 'hidden';

          document.dispatchEvent(new CustomEvent('showWindyMap', {
            detail: {
              oldMapProvider: oldMapProvider,
              styleId: styleId,
              zoom: previousZoom,
              center: previousCenter
            }
          }));
        } else if (styleId === 'mapGoogleSatellite' || styleId === 'mapGoogleHybrid') {
          // Google map
          document.getElementById('windy').style.visibility = 'hidden';
          document.getElementById('mapbox').style.visibility = 'hidden';
          document.getElementById('google').style.visibility = 'visible';

          document.dispatchEvent(new CustomEvent('showGoogleMap', {
            detail: {
              oldMapProvider: oldMapProvider,
              styleId: styleId.replace('mapGoogle', '').toLowerCase(),
              zoom: previousZoom,
              center: previousCenter
            }
          }));
        } else {
          // Mapbox map
          document.getElementById('windy').style.visibility = 'hidden';
          document.getElementById('mapbox').style.visibility = 'visible';
          document.getElementById('google').style.visibility = 'hidden';

          mapboxgl.accessToken = config.MAPBOX_ACCESS_TOKEN;
          mapView.map.setStyle(JSON.parse(srcElement.dataset.uri));

          mapView.map.setCenter([previousCenter.lng, previousCenter.lat]);
          mapView.map.setZoom(oldMapProvider !== 'mapbox' ? previousZoom - 1 : previousZoom);
        }
        me.afterSwitch();
        me.mapStyleContainer.style.display = 'none';
        me.styleButton.style.display = 'block';

        const elms = me.mapStyleContainer.getElementsByClassName('active');
        while (elms[0]) {
          elms[0].classList.remove('active');
        }
        srcElement.classList.add('active');
      });

      if (style.id === me.defaultStyle) {
        container.classList.add('active');
      }
      me.mapStyleContainer.appendChild(container);

      return container;
    }

    const addStyleItemHotSpots = (style) => {
      const container = document.createElement('div');
      container.innerText = style.title;
      container.classList.add(style.id);

      // Add time checkboxes
      const checkboxesDiv = document.createElement('div');
      checkboxesDiv.style.padding = '5px';

      for (const c of style.checkboxes) {
        const checkboxSpan = document.createElement('span');

        const checkbox = document.createElement('input');
        checkbox.classList.add('fire-checkbox');
        checkbox.type = 'checkbox';
        checkbox.id = c.id;
        checkbox.innerText = c.title;
        checkbox.dataset.id = c.id;
        checkboxSpan.appendChild(checkbox);

        const label = document.createElement('label');
        label.for = c.id;
        label.innerText = c.title;
        checkboxSpan.appendChild(label);

        checkboxesDiv.appendChild(checkboxSpan);

        checkbox.addEventListener('change', event => {
          for (let c1 of container.getElementsByClassName('fire-checkbox')) {
            if (c1 !== event.target) c1.checked = false
          }
          const dataId = event.target.dataset.id;
          const checked = event.target.checked;

          document.dispatchEvent(new CustomEvent('changeFireSelection', {
            detail: {
              time: dataId.replace('mapFIRMS-', '_'),
              checked: checked
            }
          }));
        });
      }
      container.appendChild(checkboxesDiv);
      
      me.mapStyleContainer.appendChild(container);
    }

    for (const style of me.styles) {
      if (style.id === 'mapHotSpots') {
        addStyleItemHotSpots(style);
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
