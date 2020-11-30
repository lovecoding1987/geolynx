import mapboxgl from 'mapbox-gl';
import parse from 'csv-parse';

export const addFireLayers = async (source, map, firmsKind) => {
    if (map.getSource(source)) {
        map.setLayoutProperty(source, 'visibility', 'visible'); return;
    };

    let url, color, stroke_color, title;
    switch (source) {
        case 'mapModis-24hrs':
            url = '/data/active_fire/c6/csv/MODIS_C6_South_America_24h.csv'; 
            color = '#fffc61';
            stroke_color = '#f52e2e';
            title = 'MODIS';
            break;
        case 'mapModis-48hrs':
            url = '/data/active_fire/c6/csv/MODIS_C6_South_America_48h.csv'; 
            color = '#ff8361';
            stroke_color = '#f5af2e';
            title = 'MODIS';
            break;
        case 'mapModis-7days':
            url = '/data/active_fire/c6/csv/MODIS_C6_South_America_7d.csv'; 
            color = '#d7ff61';
            stroke_color = '#f5c72e';
            title = 'MODIS';
            break;
        case 'mapVIIRS-S-NPP-24hrs':
            url = '/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_America_24h.csv'; 
            color = '#fffc61';
            stroke_color = '#f52e2e';
            title = 'VIIRS Suomi NPP';
            break;
        case 'mapVIIRS-S-NPP-48hrs':
            url = '/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_America_48h.csv';
            color = '#ff8361';
            stroke_color = '#f5af2e';
            title = 'VIIRS Suomi NPP';
            break;
        case 'mapVIIRS-S-NPP-7days':
            url = '/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_America_7d.csv'; 
            color = '#d7ff61';
            stroke_color = '#f5c72e';
            title = 'VIIRS Suomi NPP';
            break;
        case 'mapVIIRS-NOAA-20-24hrs':
            url = '/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_America_24h.csv'; 
            color = '#fffc61';
            stroke_color = '#f52e2e';
            title = 'VIIRS NOAA-20';
            break;
        case 'mapVIIRS-NOAA-20-48hrs':
            url = '/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_America_48h.csv'; 
            color = '#ff8361';
            stroke_color = '#f5af2e';
            title = 'VIIRS NOAA-20';
            break;
        case 'mapVIIRS-NOAA-20-7days':
            url = '/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_America_7d.csv'; 
            color = '#d7ff61';
            stroke_color = '#f5c72e';
            title = 'VIIRS NOAA-20';
            break;
        default:
    }

    const data = await fetch(url).then((res) => res.text());

    parse(data.trim(), {
        columns: true,
        from_line: 1
    }, async function (err, records) {
        if (err) return;
        
        const features = records.map(record => {
            const date = new Date(record.acq_date);
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [record.longitude, record.latitude]
                },
                properties: {
                    description: `<strong>${title}</strong><br/>Date: ${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}, Time: ${record.acq_time.substring(0, 2)}:${record.acq_time.substring(2)}`
                }
            }
        });

        map.addSource(source, {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': features
            }
        });

        map.addLayer({
            'id': source,
            'type': 'circle',
            'source': source,
            'paint': {
                'circle-radius': 10,
                'circle-color': color,
                'circle-blur': 0.4,
                'circle-opacity': 0.7,
                'circle-stroke-color': stroke_color,
                'circle-stroke-width': 3,
                'circle-stroke-opacity': 1
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


        for(const checkbox of document.getElementById('map-style-container').getElementsByTagName('input')) {
            if (checkbox.dataset.id === firmsKind)     {
                map.setLayoutProperty(
                    source,
                    'visibility',
                    checkbox.checked ? 'visible' : 'none'
                )                
            }
        }
    })
}

export const removeFireLayers = (source, map) => {
    if (map.getLayer(source)) {
        map.setLayoutProperty(
            source,
            'visibility',
            'none'
        )
    }
}