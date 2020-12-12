import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useSelector, useDispatch } from 'react-redux';

import { mapView } from './Map';
import { fetchFIRMS } from './FetchFIRMS';
import { firesActions } from '../store';

import { FIRMS_CATEGORIES } from '../common/constants';


const createFeature = (record) => {
    const datetime = new Date(`${record.acq_date} ${record.acq_time.substring(0, 2)}:${record.acq_time.substring(2)}:00`);
    let timediff = parseInt((new Date() - datetime) / 1000 / 60 / 60);
    if (timediff < 0) timediff = 0;
    if (timediff > 48) timediff = 48;

    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [parseFloat(record.longitude), parseFloat(record.latitude)]
        },
        properties: {
            fire: true,
            description: `<strong>${record.title}</strong><br/>Date: ${datetime.getDate()}-${datetime.getMonth() + 1}-${datetime.getFullYear()}, Time: ${datetime.getHours()}:${datetime.getMinutes()}`,
            description1: `${record.title}, Date: ${datetime.getDate()}-${datetime.getMonth() + 1}-${datetime.getFullYear()}, Time: ${datetime.getHours()}:${datetime.getMinutes()}`,
            colordiff: 255 - parseInt(255 * timediff / 48)
        }
    };
}

const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

const onMapboxMouseEnter = (e) => {
    const map = mapView.mapboxMap;
    map.getCanvas().style.cursor = 'pointer';

    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.description;
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    popup.setLngLat(coordinates).setHTML(description).addTo(map);
}

const onMapboxMouseLeave = () => {
    const map = mapView.mapboxMap;
    map.getCanvas().style.cursor = '';
    popup.remove();
}

const FiresMap = () => {
    const id = 'fires';

    const dispatch = useDispatch();
    const data = useSelector(state => state.fires.data);
    const times = useSelector(state => state.fires.times);

    // Initialize sources and layers
    useEffect(() => {
        const mapboxMap = mapView.mapboxMap;

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
                'type': 'circle',
                'source': id,
                'paint': {
                    'circle-radius': 10,
                    'circle-color': [
                        'rgb',
                        255,
                        ['-', 255, ['get', 'colordiff']],
                        0
                    ],
                    'circle-blur': 0.4,
                    'circle-opacity': 0.7,
                    //'circle-stroke-color': strokeColorByTime(time),
                    //'circle-stroke-width': 3,
                    //'circle-stroke-opacity': 1
                }
            });
        }

        mapboxMap.on('mouseenter', id, onMapboxMouseEnter);
        mapboxMap.on('mouseleave', id, onMapboxMouseLeave);

        return () => {
            mapboxMap.off('mouseenter', id, onMapboxMouseEnter);
            mapboxMap.off('mouseleave', id, onMapboxMouseLeave);
            if (mapboxMap.getLayer(id)) mapboxMap.removeLayer(id);
            if (mapboxMap.getSource(id)) mapboxMap.removeSource(id);
        };
    }, []);

    // Set feature data
    useEffect(() => {
        const mapboxMap = mapView.mapboxMap;

        const getFeatures = () => {
            const features = [];
            Object.keys(data).forEach((time) => {
                if (times.indexOf(time) > -1) {
                    const records = data[time];
                    if (records) {
                        records.forEach(record => {
                            features.push(createFeature(record));
                        })
                    }
                }
            })
            return features
        }

        const features = getFeatures();

        if (mapboxMap.getSource(id)) {
            mapboxMap.getSource(id).setData({
                type: 'FeatureCollection',
                features: features
            });
        }


        const interval = setInterval(() => {
            if (mapView.googleMap) {
                const map = mapView.googleMap;

                map.data.forEach((feature) => { if (feature.getProperty('fire')) map.data.remove(feature) });

                map.data.addGeoJson({
                    type: 'FeatureCollection',
                    features: features
                });


                clearInterval(interval);
            }
        }, 100)
    }, [data, times]);

    useEffect(() => {
        const onChangeFireSelection = async (e) => {
            const { time, checked } = e.detail;

            if (checked) {
                const promises = FIRMS_CATEGORIES.map(category => fetchFIRMS(category, time));
                const items = await Promise.all(promises);
                dispatch(firesActions.updateData({ time, items: [].concat(...items) }));
                dispatch(firesActions.selectTime(time));
            } else {
                dispatch(firesActions.delectTime(time));
            }
        }
        document.addEventListener('changeFireSelection', onChangeFireSelection);

        return () => {
            document.removeEventListener('changeFireSelection', onChangeFireSelection);
        }
    })
    return null;
}

export default FiresMap;
