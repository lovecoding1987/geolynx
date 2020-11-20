import 'mapbox-gl/dist/mapbox-gl.css';
import './switcher/switcher.css';
import mapboxgl from 'mapbox-gl';
import MapView from './MapView';
import { SwitcherControl } from './switcher/switcher';
import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { deviceCategories } from '../common/deviceCategories';
import { loadIcon, loadImage } from './mapUtil';
import { styleMapbox, styleOsm } from './mapStyles';
import t from '../common/localization';
import { useAttributePreference } from '../common/preferences';

const mapView = new MapView();
export const map = mapView.getMap();

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

const initMap = async () => {
  const background = await loadImage('images/background.svg');
  await Promise.all(deviceCategories.map(async category => {
    if (!mapView.hasImage(category)) {
      const imageData = await loadIcon(category, background, `images/icon/${category}.svg`);
      mapView.addImage(category, imageData, { pixelRatio: window.devicePixelRatio });
    }
  }));
  updateReadyValue(true);
};

mapView.on('load', initMap);

/*mapView.addControl(new mapboxgl.NavigationControl({
  showCompass: false,
}));*/

mapView.addControl(new SwitcherControl(
  [
    { id: 'mapOsm', title: t('mapOsm'), uri: styleOsm() },
    {
      id: 'mapGoogle', title: t('google'), uri: ''
    }, 
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
      title: t('hot_spots'),
      items: [
        { id: 'mapVIIRS-24hrs', title: `${t('VIIRS')} 24 hrs`, uri: '' },
        { id: 'mapVIIRS-48hrs', title: `${t('VIIRS')} 48 hrs`, uri: '' },
        { id: 'mapVIIRS-72hrs', title: `${t('VIIRS')} 72 hrs`, uri: '' },
        { id: 'mapVIIRS-7days', title: `${t('VIIRS')} 7 days`, uri: '' },
        { id: 'mapModis-24hrs', title: `${t('Modis')} 24 hrs`, uri: '' },
        { id: 'mapModis-48hrs', title: `${t('Modis')} 48 hrs`, uri: '' },
        { id: 'mapModis-72hrs', title: `${t('Modis')} 72 hrs`, uri: '' },
        { id: 'mapModis-7days', title: `${t('Modis')} 7 days`, uri: '' },
      ]
    }    
  ],
  'mapOsm',
  (styleId) => {
    mapView.setMap(styleId);
    updateReadyValue(false)
  },
  () => {
    setTimeout(() => {
      const waiting = () => {
        if (!mapView.loaded()) {
          setTimeout(waiting, 100);
        } else {
          initMap();
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
