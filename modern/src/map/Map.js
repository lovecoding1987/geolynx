import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';

import { SwitcherControl } from './switcher/switcher';
import { styleMapbox, styleOsm } from './mapStyles';
import t from '../common/localization';
import DrawPopover from './DrawPopover';
import MapView, { initMapboxMap } from './MapView';
import { loadSymbolImage } from './mapUtil';
import { FirmsFilter } from './switcher/firms-filter';

export const mapView = new MapView();

export const mapboxMap = mapView.mapboxMap;
export const googleMap = mapView.googleMap;

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

mapView.onLoadedMapboxMap = () => {
  updateReadyValue(true);
}

mapView.addControl(new SwitcherControl(
  [
    { id: 'mapOsm', title: t('mapOsm'), uri: styleOsm() },
    { id: 'mapGoogleSatellite', title: t('satellite'), uri: '' },
    { id: 'mapGoogleHybrid', title: t('hybrid'), uri: '' },
    { id: 'mapMapboxGround', title: t('terrain'), uri: styleMapbox('ckgnq6z3g0cpk1amqw19grzdk') },
    { id: 'mapMapboxVegetation', title: t('vegetation'), uri: styleMapbox('ckgh3eou302i219pbebto8f0c') },
    { id: 'mapMapboxApplications', title: t('applications'), uri: styleMapbox('ckhhgcqyq08or19mixazio9js') },
    { id: 'mapMapboxDemo', title: t('demo'), uri: styleMapbox('ckhl25qo906em19mcaj1x2evp') },
    { id: 'mapWinds', title: t('winds'), uri: '' },
    { id: 'mapTemperatures', title: t('temperatures'), uri: '' },
    { id: 'mapRainThunder', title: t('rain'), uri: '' },
    {
      id: 'mapHotSpots',
      title: t('hot_spots'),
      uri: '',
      checkboxes: [
        { id: 'mapFIRMS-24h', title: `24 ${t('hrs')}` },
        { id: 'mapFIRMS-48h', title: `48 ${t('hrs')}` },
        { id: 'mapFIRMS-7d', title: `7 ${t('days')}` },
      ]
    }
  ],
  'mapOsm',
  (styleId) => {
    mapView.setMapByStyle(styleId);
    updateReadyValue(false);
  },
  () => {
    setTimeout(() => {
      const waiting = () => {
        if (!mapView.loaded()) {
          setTimeout(waiting, 100);
        } else {
          initMapboxMap(mapboxMap, () => { updateReadyValue(true) });
        }
      };
      waiting();
    }, 300)
  },
));

mapView.addControl(new FirmsFilter());

const Map = ({ children, mapStyle }) => {
  const containerEl = useRef(null);

  const [mapReady, setMapReady] = useState(false);
  const [popoverData, setPopoverData] = useState(null);


  useEffect(() => {
    if (window.googleAPI_loaded) return;
    
    const googleAPIScript = document.createElement('script');
    googleAPIScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDyXPc-p1DO_LVfuV-05JCzk8TO096r-TE&callback=initGoogleMap`;
    googleAPIScript.defer = true; 
    document.body.appendChild(googleAPIScript);
    window.googleAPI_loaded = true;
    
  }, []);


  useEffect(() => {
    if (window.windymapLoaded) return;

    const script = document.createElement('script');
    script.src = "/windymap.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    }
  }, []);


  useEffect(() => {
    const onSetWindyMap = (e) => {
      mapView.setWindyMap(e.detail.map);
      mapView.setWindyStore(e.detail.store);
    }
    document.addEventListener('setWindyMap', onSetWindyMap, false);

    return () => {
      document.removeEventListener("setWindyMap", onSetWindyMap);
    }
  })

  useEffect(() => {
    const onSetGoogleMap = (e) => {
      mapView.setGoogleMap(e.detail.map);
    }
    document.addEventListener('setGoogleMap', onSetGoogleMap, false);

    return () => {
      document.removeEventListener("setGoogleMap", onSetGoogleMap);
    }
  })

  useEffect(() => {
    mapView.mapboxMap.on('draw.selectionchange', (e) => {
      const features = e.features;
      setPopoverData(features.length > 0 ? features[0] : null);
    })
  })

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

  const popoverHandleClose = () => {
    setPopoverData(null);
  }

  const setDrawProperties = (featureId, data) => {
    const draw = mapView.mapboxDraw;
    const feature = draw.get(featureId);
    if (feature.geometry.type === 'Point') {
      loadSymbolImage(mapView.mapboxMap, { ...feature.properties, ...data });
    }
    Object.keys(data).forEach(key => { mapView.mapboxDraw.setFeatureProperty(featureId, key, data[key]) })
  }

  const popoverOpen = popoverData !== null;
  return (
    <div style={{ width: '100%', height: '100%' }} ref={containerEl}>
      {mapReady && children}

      {popoverData && <DrawPopover
        open={popoverOpen}
        handleClose={popoverHandleClose}
        data={popoverData}
        changeDrawProperties={setDrawProperties}
      />}
    </div>
  );
};

export default Map;
