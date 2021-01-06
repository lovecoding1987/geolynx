import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useSelector, useDispatch } from 'react-redux';
import hexRgb from 'hex-rgb';
import { mapView } from './Map';
import { fetchBurnedData, fetchFIRMS, fetchOldFIRMS } from './FetchFIRMS';
import { firesActions } from '../store';

import { FIRMS_CATEGORIES } from '../common/constants';
import { colorByHoursDiff, colorByMonth } from './mapUtil';

const fireIconTemplate = (color) => {
    return [
        '<?xml version="1.0"?>',
        '<svg width="20px" height="20px" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">',
        `<circle stroke="${color}" fill="${color}" opacity="0.7" cx="50" cy="50" r="50"/>`,
        '</svg>'
    ].join('\n');
}

const createFeature = (record) => {
    const datetime = new Date(`${record.acq_date} ${record.acq_time.substring(0, 2)}:${record.acq_time.substring(2)}:00`);

    if (datetime instanceof Date && !isNaN(datetime)) {

        const timediff = parseInt((new Date() - datetime) / 1000 / 60 / 60);


        const color = record.old ? colorByMonth(datetime.getMonth() + 1) : colorByHoursDiff(timediff);

        const colorRgb = hexRgb(color);
        const svg = fireIconTemplate(color);

        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [parseFloat(record.longitude), parseFloat(record.latitude)]
            },
            properties: {
                fire: true,
                type: record.type,
                description: `<strong>${record.type}</strong><br/>Date: ${datetime.getDate()}-${datetime.getMonth() + 1}-${datetime.getFullYear()}, Time: ${datetime.getHours()}:${datetime.getMinutes()}<br/>Confidence: ${record.confidence}`,
                description1: `${record.type}, Date: ${datetime.getDate()}-${datetime.getMonth() + 1}-${datetime.getFullYear()}, Time: ${datetime.getHours()}:${datetime.getMinutes()}, Confidence: ${record.confidence}`,
                color: color,
                colorR: colorRgb.red,
                colorG: colorRgb.green,
                colorB: colorRgb.blue,
                icon: 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(svg)
            }
        };
    }
}

const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

const onMapboxMouseEnter = (e) => {
    const map = mapView.mapboxMap;
    map.getCanvas().style.cursor = 'pointer';

    const feature = e.features[0];

    let html;
    if (feature.layer.id === 'fires') {
        html = feature.properties.description;
    } else if (feature.layer.id === 'clusters') {
        html = `<label>MODIS: </label><span>${feature.properties['MODIS']}</span><br/><label>VIIRS-S-NPP: </label><span>${feature.properties['VIIRS-S-NPP']}</span><br/><label>VIIRS-NOAA-20: </label><span>${feature.properties['VIIRS-NOAA-20']}</span>`;
    } else if (feature.layer.id === 'burned') {
        html = `Burned date: ${feature.properties['BurnDate']}`
    }
    popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
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

let googleMarkerCluster;

const FiresMap = () => {

    const dispatch = useDispatch();
    const data = useSelector(state => state.fires.data);
    const time = useSelector(state => state.fires.time);

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
                    'colorR': ['+', ['get', 'colorR']],
                    'colorG': ['+', ['get', 'colorG']],
                    'colorB': ['+', ['get', 'colorB']],
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
                        ['/', ['get', 'colorR'], ['get', 'point_count']],
                        ['/', ['get', 'colorG'], ['get', 'point_count']],
                        ['/', ['get', 'colorB'], ['get', 'point_count']]
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
                    'circle-color': ['get', 'color'],
                    'circle-radius': 10,
                    'circle-blur': 0.4,
                    'circle-opacity': 0.7
                }
            });
        }

        if (!mapboxMap.getSource('burned')) {
            mapboxMap.addSource('burned', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [],
                },
            });
        }

        if (!mapboxMap.getLayer('burned')) {
            mapboxMap.addLayer({
                id: 'burned',
                type: 'fill',
                source: 'burned',
                'paint': {
                    'fill-color': ['get', 'color'],
                    'fill-opacity': 0.5
                }
            });
        }

        mapboxMap.on('mouseenter', 'fires', onMapboxMouseEnter);
        mapboxMap.on('mouseenter', 'clusters', onMapboxMouseEnter);
        mapboxMap.on('mouseenter', 'burned', onMapboxMouseEnter);
        mapboxMap.on('mouseleave', 'fires', onMapboxMouseLeave);
        mapboxMap.on('mouseleave', 'clusters', onMapboxMouseLeave);
        mapboxMap.on('mouseleave', 'burned', onMapboxMouseLeave);

        mapboxMap.on('click', 'clusters', onMapboxClick);


        return () => {
            mapboxMap.off('mouseenter', 'fires', onMapboxMouseEnter);
            mapboxMap.off('mouseenter', 'clusters', onMapboxMouseEnter);
            mapboxMap.off('mouseenter', 'burned', onMapboxMouseEnter);
            mapboxMap.off('mouseleave', 'fires', onMapboxMouseLeave);
            mapboxMap.off('mouseleave', 'clusters', onMapboxMouseLeave);
            mapboxMap.off('mouseleave', 'burned', onMapboxMouseLeave);

            mapboxMap.off('click', 'clusters', onMapboxClick);
            if (mapboxMap.getLayer('cluster-count')) mapboxMap.removeLayer('cluster-count');
            if (mapboxMap.getLayer('clusters')) mapboxMap.removeLayer('clusters');
            if (mapboxMap.getLayer('fires')) mapboxMap.removeLayer('fires');
            if (mapboxMap.getSource('fires')) mapboxMap.removeSource('fires');
        };
    }, []);

    // Set feature data for fire dots
    useEffect(() => {
        const mapboxMap = mapView.mapboxMap;

        const getFeatures = () => {
            const features = [];
            Object.keys(data).forEach((t) => {
                if (time !== '_old_burned_areas' && time == t) {
                    const records = data[t];
                    if (records && records.length > 0) {
                        records.forEach(record => {
                            const feature = createFeature(record);
                            if (feature) features.push(feature);
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

                if (googleMarkerCluster) googleMarkerCluster.clearMarkers();
                const markers = features.map(feature => (
                    new window.google.maps.Marker({
                        position: { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] },
                        icon: feature.properties.icon,
                        color: feature.properties.color,
                        colorR: feature.properties.colorR,
                        colorG: feature.properties.colorG,
                        colorB: feature.properties.colorB,
                        title: feature.properties.description1
                    })
                ));

                googleMarkerCluster = new window.MarkerClusterer(map, markers);

                clearInterval(interval);
            }
        }, 100)
    }, [data, time]);

    useEffect(() => {
        const mapboxMap = mapView.mapboxMap;

        const features = time == '_old_burned_areas' ? data[time] : [];

        if (mapboxMap.getSource('burned')) {
            mapboxMap.getSource('burned').setData({
                type: 'FeatureCollection',
                features: features
            });
        }

        const interval = setInterval(() => {
            if (mapView.googleMap) {
                const map = mapView.googleMap;

                if (time == '_old_burned_areas') {
                    features.forEach(feature => {
                        const paths = [];
                        const len = feature.geometry.coordinates[0][0].length;
                        for (let i = 0; i < len; i++) {
                            const pt = new window.google.maps.LatLng(feature.geometry.coordinates[0][0][i][1], feature.geometry.coordinates[0][0][i][0]);
                            paths.push(pt);
                        }
                        paths.push(new window.google.maps.LatLng(feature.geometry.coordinates[0][0][0][1], feature.geometry.coordinates[0][0][0][0]))
                        
                        const polyline = new window.google.maps.Polygon({
                            paths: paths,
                            strokeColor: feature.properties.color,
                            strokeWeight: 2,
                            strokeOpacity: 1,
                            fillColor: feature.properties.color,
                            fillOpacity: 0.5
                        });
    
                        polyline.setMap(map);
                    })
                }

                clearInterval(interval);
            }
        }, 100)
    }, [data, time])

    useEffect(() => {
        const onChangeFireSelection = async (e) => {
            const { time, checked } = e.detail;

            if (checked) {
                if (time !== '_old') {
                    dispatch(firesActions.selectTime(time));
                    dispatch(firesActions.setLoading(true));
                    const promises = FIRMS_CATEGORIES.map(category => fetchFIRMS(category, time));
                    const items = await Promise.all(promises);
                    dispatch(firesActions.updateData({ time, items: [].concat(...items) }));
                    dispatch(firesActions.setLoading(false));
                }
            } else {
                dispatch(firesActions.deselectTime())
            }
        }
        document.addEventListener('changeFireSelection', onChangeFireSelection);

        return () => {
            document.removeEventListener('changeFireSelection', onChangeFireSelection);
        }
    });

    useEffect(() => {
        const onClickSearch = async () => {
            const type = document.getElementsByName('filter_type')[0].value;
            const country = document.getElementsByName('filter_country')[0].value;
            const year = document.getElementsByName('filter_year')[0].value;
            const months = [...document.getElementsByName('filter_month')].filter(option=>option.checked).map(option => option.value);

            try {
                dispatch(firesActions.setLoading(true));     
                dispatch(firesActions.selectTime(`_old_${type}`));

                const promises = months.map(month => type === 'hot_spots' ? fetchOldFIRMS(country, year, month) : fetchBurnedData(country, year, month));
                const data = await Promise.all(promises);
                dispatch(firesActions.updateData({ time: `_old_${type}`, items: [].concat(...data) }));
            } finally {
                dispatch(firesActions.setLoading(false));
            }
        };

        document.getElementById('firms-search').addEventListener('click', onClickSearch);

        return () => {
            if (document.getElementById('firms-search')) document.getElementById('firms-search').removeEventListener('click', onClickSearch);
        }
    });

    return null;
}

export default FiresMap;
