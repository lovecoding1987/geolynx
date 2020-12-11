import React, { useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import { Provider, useSelector } from 'react-redux';

import { mapboxMap, mapView } from './Map';
import store from '../store';
import { useHistory } from 'react-router-dom';
import StatusView from './StatusView';

const PositionsMap = ({ positions }) => {
  const id = 'positions';

  const history = useHistory();
  const devices = useSelector(state => state.devices.items);

  const createFeature = (devices, position) => {
    const device = devices[position.deviceId] || null;
    const category = device && (device.category || 'default');
    return {
      deviceId: position.deviceId,
      name: device ? device.name : '',
      category: category,
      icon: `/images/icon/${category}.png`
    }
  };

  const onMouseEnter = () => mapboxMap.getCanvas().style.cursor = 'pointer';
  const onMouseLeave = () => mapboxMap.getCanvas().style.cursor = '';

  const onClickMapboxCallback = useCallback(event => {
    const feature = event.features[0];
    let coordinates = feature.geometry.coordinates.slice();
    while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    const placeholder = document.createElement('div');
    ReactDOM.render(
      <Provider store={store}>
        <StatusView deviceId={feature.properties.deviceId} onShowDetails={positionId => history.push(`/position/${positionId}`)} />
      </Provider>,
      placeholder
    );

    new mapboxgl.Popup({
      offset: 25,
      anchor: 'top'
    })
      .setDOMContent(placeholder)
      .setLngLat(coordinates)
      .addTo(mapboxMap);
  }, [history]);

  const onClickGoogleCallback = useCallback(event => {
    const feature = event.feature;
    if (!feature.getProperty('deviceId')) return;

    const placeholder = document.createElement('div');
    ReactDOM.render(
      <Provider store={store}>
        <StatusView deviceId={feature.getProperty('deviceId')} onShowDetails={positionId => history.push(`/position/${positionId}`)} />
      </Provider>,
      placeholder
    );

    const infowindow = new window.google.maps.InfoWindow({
      content: placeholder,
      position: feature.getGeometry().get(),
      options: {
        pixelOffset: new window.google.maps.Size(0, -30)
      }
    });

    infowindow.open(mapView.googleMap)
  }, [history]);

  let googleMapClickListenter;

  useEffect(() => {
    if (!mapboxMap.getSource(id)) {
      mapboxMap.addSource(id, {
        'type': 'geojson',
        'data': {
          type: 'FeatureCollection',
          features: [],
        }
      });
    }

    if (!mapboxMap.getLayer(id)) {
      mapboxMap.addLayer({
        'id': id,
        'type': 'symbol',
        'source': id,
        'layout': {
          'icon-image': '{category}',
          'icon-allow-overlap': true,
          'text-field': '{name}',
          'text-allow-overlap': true,
          'text-anchor': 'bottom',
          'text-offset': [0, -2],
          'text-font': ['Roboto Regular'],
          'text-size': 12,
        },
        'paint': {
          'text-halo-color': 'white',
          'text-halo-width': 1,
        },
      });


    }

    mapboxMap.on('mouseenter', id, onMouseEnter);
    mapboxMap.on('mouseleave', id, onMouseLeave);
    mapboxMap.on('click', id, onClickMapboxCallback);

    const interval = setInterval(() => {
      if (mapView.googleMap) {
        googleMapClickListenter = mapView.googleMap.data.addListener('click', onClickGoogleCallback);
        clearInterval(interval);
      }
    }, 100)
    return () => {
      Array.from(mapboxMap.getContainer().getElementsByClassName('mapboxgl-popup')).forEach(el => el.remove());

      mapboxMap.off('mouseenter', id, onMouseEnter);
      mapboxMap.off('mouseleave', id, onMouseLeave);
      mapboxMap.off('click', id, onClickMapboxCallback);

      if (mapboxMap.getLayer(id)) mapboxMap.removeLayer(id);
      if (mapboxMap.getSource(id)) mapboxMap.removeSource(id);

      if (googleMapClickListenter) {
        window.google.maps.event.removeListener(googleMapClickListenter);
      }
    };
  }, [onClickMapboxCallback]);

  useEffect(() => {
    const features = positions.map(position => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [position.longitude, position.latitude],
      },
      properties: createFeature(devices, position),
    }));

    if (mapboxMap.getSource(id)) {
      mapboxMap.getSource(id).setData({
        type: 'FeatureCollection',
        features: features
      });
    }


    const interval = setInterval(() => {
      if (mapView.googleMap) {
        mapView.googleMap.data.addGeoJson({
          type: 'FeatureCollection',
          features: features
        });

        clearInterval(interval);
      }
    }, 100)
  }, [devices, positions]);

  return null;
}

export default PositionsMap;
