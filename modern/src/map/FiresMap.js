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
            type: record.title,
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

    const feature = e.features[0];

    const coordinates = feature.geometry.coordinates.slice();
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    const html = feature.layer.id === 'fires' ? feature.properties.description : `<label>MODIS: </label><span>${feature.properties['MODIS']}</span><br/><label>VIIRS-S-NPP: </label><span>${feature.properties['VIIRS-S-NPP']}</span><br/><label>VIIRS-NOAA-20: </label><span>${feature.properties['VIIRS-NOAA-20']}</span>`;
    popup.setLngLat(coordinates).setHTML(html).addTo(map);
}

const onMapboxMouseLeave = () => {
    const map = mapView.mapboxMap;
    map.getCanvas().style.cursor = '';
    popup.remove();
}

const onMapboxClick = (e) => {
    const map = mapView.mapboxMap;
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
    });
    var clusterId = features[0].properties.cluster_id;
    map.getSource('fires').getClusterExpansionZoom(
        clusterId,
        function (err, zoom) {
            if (err) return;

            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
            });
        }
    );
}
const FiresMap = () => {

    const dispatch = useDispatch();
    const data = useSelector(state => state.fires.data);
    const times = useSelector(state => state.fires.times);

    // Initialize sources and layers
    useEffect(() => {
        const mapboxMap = mapView.mapboxMap;

        if (!mapboxMap.getSource('fires')) {
            mapboxMap.addSource('fires', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [],
                },
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50,
                clusterProperties: {
                    'colordiff': ['+', ['get', 'colordiff']],
                    'MODIS': ['+', ['case', ['==', ['get', 'type'], 'MODIS'], 1, 0]],
                    'VIIRS-S-NPP': ['+', ['case', ['==', ['get', 'type'], 'VIIRS-S-NPP'], 1, 0]],
                    'VIIRS-NOAA-20': ['+', ['case', ['==', ['get', 'type'], 'VIIRS-NOAA-20'], 1, 0]],
                }
            });
        }

        if (!mapboxMap.getLayer('clusters')) {
            mapboxMap.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'fires',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': [
                        'rgb',
                        255,
                        ['-', 255,
                            [
                                '/',
                                ['get', 'colordiff'],
                                ['get', 'point_count']
                            ]
                        ],
                        0
                    ],
                    'circle-opacity': 0.7,
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        20,
                        100,
                        30,
                        750,
                        40
                    ]
                }
            });
        }

        if (!mapboxMap.getLayer('cluster-count')) {
            mapboxMap.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'fires',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                }
            });
        }

        if (!mapboxMap.getLayer('fires')) {
            mapboxMap.addLayer({
                id: 'fires',
                type: 'circle',
                source: 'fires',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': ['rgb', 255, ['-', 255, ['get', 'colordiff']], 0],
                    'circle-radius': 10,
                    'circle-blur': 0.4,
                    'circle-opacity': 0.7
                }
            });
        }

        mapboxMap.on('mouseenter', 'fires', onMapboxMouseEnter);
        mapboxMap.on('mouseenter', 'clusters', onMapboxMouseEnter);
        mapboxMap.on('mouseleave', 'fires', onMapboxMouseLeave);
        mapboxMap.on('mouseleave', 'clusters', onMapboxMouseLeave);
        mapboxMap.on('click', 'clusters', onMapboxClick);


        return () => {
            mapboxMap.off('mouseenter', 'fires', onMapboxMouseEnter);
            mapboxMap.off('mouseenter', 'clusters', onMapboxMouseEnter);
            mapboxMap.off('mouseleave', 'fires', onMapboxMouseLeave);
            mapboxMap.off('mouseleave', 'clusters', onMapboxMouseLeave);
            mapboxMap.off('click', 'clusters', onMapboxClick);
            if (mapboxMap.getLayer('cluster-count')) mapboxMap.removeLayer('cluster-count');
            if (mapboxMap.getLayer('clusters')) mapboxMap.removeLayer('clusters');
            if (mapboxMap.getLayer('fires')) mapboxMap.removeLayer('fires');
            if (mapboxMap.getSource('fires')) mapboxMap.removeSource('fires');
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
                    if (records && records.length > 0) {
                        records.forEach(record => {
                            features.push(createFeature(record));
                        })
                    }
                }
            })
            return features
        }

        const features = getFeatures();

        if (mapboxMap.getSource('fires')) {
            mapboxMap.getSource('fires').setData({
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
                dispatch(firesActions.selectTime(time));
                const promises = FIRMS_CATEGORIES.map(category => fetchFIRMS(category, time));
                const items = await Promise.all(promises);
                dispatch(firesActions.updateData({ time, items: [].concat(...items) }));
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
