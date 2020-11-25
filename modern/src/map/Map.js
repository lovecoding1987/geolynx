import 'mapbox-gl/dist/mapbox-gl.css';
import './switcher/switcher.css';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import MapView, {initMapboxMap} from './MapView';
import { SwitcherControl } from './switcher/switcher';
import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { styleMapbox, styleOsm } from './mapStyles';
import t from '../common/localization';
import { useAttributePreference } from '../common/preferences';

const mapView = new MapView();
export const map = mapView.mapboxMap;

let ready = false;
const readyListeners = new Set();

const addReadyListener = listener => {
  readyListeners.add(listener);
  listener(ready);
};

const removeReadyListener = listener => {
  readyListeners.delete(listener);
};

const updateReadyValue = value => {
  ready = value;
  readyListeners.forEach(listener => listener(value));
};


mapView.addControl(new SwitcherControl(
  [
    { id: 'mapOsm', title: t('mapOsm'), uri: styleOsm() },
    {
      title: t('mapbox'),
      items: [
        { id: 'mapMapboxGround', title: t('ground'), uri: styleMapbox('ckgnq6z3g0cpk1amqw19grzdk') },
        { id: 'mapMapboxVegetation', title: t('vegetation'), uri: styleMapbox('ckgh3eou302i219pbebto8f0c') },
        { id: 'mapMapboxApplications', title: t('applications'), uri: styleMapbox('ckhhgcqyq08or19mixazio9js') },
        { id: 'mapMapboxDemo', title: t('demo'), uri: styleMapbox('ckhl25qo906em19mcaj1x2evp') }
      ]
    },
    {
      title: t('weather'),
      items: [
        { id: 'mapWinds', title: t('winds'), uri: ''},
        { id: 'mapTemperatures', title: t('temperatures'), uri: ''},
      ]
    }, 
    {
      id: 'mapFIRMS',
      title: t('hot_spots'),
      uri: styleMapbox('ckhvoc3ym0grz19k72icogk47'),
      items: [
        {
          title: 'Modis', 
          img: 'images/fire_modis.png',
          checkboxes: true,
          items:[
            {id: 'mapModis-24hrs', title: '24 hrs'},
            {id: 'mapModis-48hrs', title: '48 hrs'},
            {id: 'mapModis-7days', title: '7 days'},
          ]
        },
        {
          title: 'VIIRS S-NPP', 
          img: 'images/fire_viirs_snpp.png',
          checkboxes: true,
          items:[
            {id: 'mapVIIRS-S-NPP-24hrs', title: '24 hrs'},
            {id: 'mapVIIRS-S-NPP-48hrs', title: '48 hrs'},
            {id: 'mapVIIRS-S-NPP-7days', title: '7 days'},
          ]
        },
        {
          title: 'VIIRS NOAA-20', 
          img: 'images/fire_viirs_noaa.png',
          checkboxes: true,
          items:[
            {id: 'mapVIIRS-NOAA-20-24hrs', title: '24 hrs'},
            {id: 'mapVIIRS-NOAA-20-48hrs', title: '48 hrs'},
            {id: 'mapVIIRS-NOAA-20-7days', title: '7 days'},
          ]
        }
      ]
    }    
  ],
  'mapOsm',
  (styleId) => {
    mapView.setMapByStyle(styleId);
    updateReadyValue(false)
  },
  () => {
    setTimeout(() => {
      const waiting = () => {
        if (!mapView.loaded()) {
          setTimeout(waiting, 100);
        } else {
          initMapboxMap(map);
        }
      };
      waiting();
    }, 300)
  },
));

const Map = ({ children }) => {
  const containerEl = useRef(null);

  const [mapReady, setMapReady] = useState(false);

  const mapboxAccessToken = useAttributePreference('mapboxAccessToken');
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "/windy.js";
    script.async = true;
    document.body.appendChild(script);
  return () => {
      document.body.removeChild(script);
    }
  }, []);

  useEffect(() => {   
    const onSetWindyMap = (e) => {
      mapView.setWindyMap(e.detail.map);
      mapView.setWindyStore(e.detail.store)
    }
    document.addEventListener('setWindyMap', onSetWindyMap, false);

    return () => {
      document.removeEventListener("setWindyMap", onSetWindyMap);
    }
  })

  useEffect(() => {
    mapboxgl.accessToken = mapboxAccessToken;
  }, [mapboxAccessToken]);

  useEffect(() => {
    const listener = ready => setMapReady(ready);
    addReadyListener(listener);
    return () => {
      removeReadyListener(listener);
      document.getElementById('windy').style.visibility = 'hidden';
      document.getElementById('mapbox').style.visibility = 'visible';
    };
  }, []);

  useLayoutEffect(() => {
    const currentEl = containerEl.current;
    currentEl.appendChild(mapView.getContainer());
    mapView.resize();
    return () => {
      currentEl.removeChild(mapView.getContainer());
    };
  }, [containerEl]);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={containerEl}>
      {mapReady && children}
    </div>
  );
};

export default Map;
