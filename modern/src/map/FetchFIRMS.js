import parse from 'csv-parse'

export const fetchFIRMS = async (url, mapView) => {
    const data = await fetch(url).then((res) => res.text());
    parse(data.trim(), {
        columns: true,
        from_line: 1
    }, function (err, records) {
        if (err) return;
        console.log(records)

        const features = records.map(record => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [record.longitude, record.latitude]
            },
            properties: {
              description: `Date: ${record.acq_date}, Time: ${record.acq_time.substring(0,2)}:${record.acq_time.substring(2)}`
            }
        }));

        const map = mapView.mapboxMap; 
        
        map.addSource('fireSource', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': features
            }
        });

        map.addLayer({
            'id': 'fireLayer',
            'type': 'symbol',
            'source': 'fireSource',
            'layout': {
                'icon-image': 'fire-marker',
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
        
    })
}