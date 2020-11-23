import mapboxgl from 'mapbox-gl';
import config from '../../config'
import { fetchFIRMS } from '../FetchFIRMS';
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
      styleElement.classList.add(style.title.replace(/[^a-z0-9-]/gi, '_'));
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

          switch (styleId) {
            case 'mapModis-24hrs':
              fetchFIRMS('/data/active_fire/c6/csv/MODIS_C6_South_America_24h.csv', mapView); break;
            case 'mapModis-48hrs':
              fetchFIRMS('/data/active_fire/c6/csv/MODIS_C6_South_America_48h.csv', mapView); break;
            case 'mapModis-7days':
              fetchFIRMS('/data/active_fire/c6/csv/MODIS_C6_South_America_7d.csv', mapView); break;
            case 'mapVIIRS-S-NPP-24hrs':
              fetchFIRMS('/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_America_24h.csv', mapView); break;
            case 'mapVIIRS-S-NPP-48hrs':
              fetchFIRMS('/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_America_48h.csv', mapView); break;
            case 'mapVIIRS-S-NPP-7days':
              fetchFIRMS('/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_America_7d.csv', mapView); break;
            case 'mapVIIRS-NOAA-20-24hrs':
              fetchFIRMS('/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_America_24h.csv', mapView); break;
            case 'mapVIIRS-NOAA-20-48hrs':
              fetchFIRMS('/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_America_48h.csv', mapView); break;
            case 'mapVIIRS-NOAA-20-7days':
              fetchFIRMS('/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_America_7d.csv', mapView); break;
            default:
          }
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
        styleElement.classList.add('active');
      }
      me.mapStyleContainer.appendChild(styleElement);
    }

    for (const style of me.styles) {
      addStyleItemButton(style);

      if (style.items) {
        for (const s of style.items) {
          addStyleItemButton(s, true);
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
