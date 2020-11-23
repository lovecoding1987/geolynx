import parse from 'csv-parse'

export const fetchFIRMS = (url, mapView) => {
    fetch(url).then((res) => {
        res.text()
            .then((data) => {
                console.log(data);
                parse(data.trim(), {
                    columns: true,
                    from_line: 1
                }, function (err, records) {
                    console.log(records)
                    if (err) return;

                    const features = records.map(record => ({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [record.longitude, record.latitude]
                        },
                        properties: null
                    }))
                    console.log(features)
                    const map = mapView.map;
                    map.loadImage(
                        '/images/fire.png',
                        function (error, image) {
                            if (error) throw error;
                            map.addImage('fire-marker', image);
                            // Add a GeoJSON source with 2 points
                            map.addSource('points', {
                                'type': 'geojson',
                                'data': {
                                    'type': 'FeatureCollection',
                                    'features': features
                                }
                            });
                            map.addLayer({
                                'id': 'points',
                                'type': 'symbol',
                                'source': 'points',
                                'layout': {
                                    'icon-image': 'fire-marker',
                                    // get the title name from the source's "title" property
                                    'text-field': ['get', 'title'],
                                    'text-font': [
                                        'Open Sans Semibold',
                                        'Arial Unicode MS Bold'
                                    ],
                                    'text-offset': [0, 1.25],
                                    'text-anchor': 'top'
                                }
                            });;
                        }
                    );
                })
            })
            .catch((error) => {
                console.error(error);
            });
    })
}