import mapboxgl from 'mapbox-gl';
import parse from 'csv-parse';
import { loadMapImage } from './mapUtil';

export const addFireLayers = async (source, map, title) => {
    if (map.getSource(source)) return;

    let url, icon;
    switch (source) {
        case 'mapModis-24hrs':
            url = '/data/active_fire/c6/csv/MODIS_C6_South_America_24h.csv'; 
            icon = 'fire_modis';
            break;
        case 'mapModis-48hrs':
            url = '/data/active_fire/c6/csv/MODIS_C6_South_America_48h.csv'; 
            icon = 'fire_modis';
            break;
        case 'mapModis-7days':
            url = '/data/active_fire/c6/csv/MODIS_C6_South_America_7d.csv'; 
            icon = 'fire_modis';
            break;
        case 'mapVIIRS-S-NPP-24hrs':
            url = '/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_America_24h.csv'; 
            icon = 'fire_viirs_snpp';
            break;
        case 'mapVIIRS-S-NPP-48hrs':
            url = '/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_America_48h.csv';
            icon = 'fire_viirs_snpp';
            break;
        case 'mapVIIRS-S-NPP-7days':
            url = '/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_America_7d.csv'; 
            icon = 'fire_viirs_snpp';
            break;
        case 'mapVIIRS-NOAA-20-24hrs':
            url = '/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_America_24h.csv'; 
            icon = 'fire_viirs_noaa';
            break;
        case 'mapVIIRS-NOAA-20-48hrs':
            url = '/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_America_48h.csv'; 
            icon = 'fire_viirs_noaa';
            break;
        case 'mapVIIRS-NOAA-20-7days':
            url = '/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_America_7d.csv'; 
            icon = 'fire_viirs_noaa';
            break;
        default:
    }

    const data = await fetch(url).then((res) => res.text());

    parse(data.trim(), {
        columns: true,
        from_line: 1
    }, async function (err, records) {
        if (err) return;
        
        if (!map.hasImage(icon)) map.addImage(icon, await loadMapImage(map, `images/${icon}.png`));
    
        const features = records.map(record => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [record.longitude, record.latitude]
            },
            properties: {
                description: `<strong>${title}</strong><br/>Date: ${record.acq_date}, Time: ${record.acq_time.substring(0, 2)}:${record.acq_time.substring(2)}`
            }
        }));

        map.addSource(source, {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': features
            }
        });

        map.addLayer({
            'id': source,
            'type': 'symbol',
            'source': source,
            'layout': {
                'icon-image': icon,
                // get the title name from the source's "title" property
                'text-field': ['get', 'title'],
                'text-font': [
                    'Open Sans Semibold',
                    'Arial Unicode MS Bold'
                ],
                'text-offset': [0, 1.25],
                'text-anchor': 'top',
                'icon-allow-overlap': true
            }
        });


        // Create a popup, but don't add it to the map yet.
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        map.on('mouseenter', source, function (e) {
            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = 'pointer';

            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup.setLngLat(coordinates).setHTML(description).addTo(map);
        });

        map.on('mouseleave', source, function () {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
    })
}

export const removeFireLayers = async (source, map) => {
    if (map.getLayer(source)) {
        map.removeLayer(source);
    }
    if (map.getSource(source)) {
        map.removeSource(source);
    }
}