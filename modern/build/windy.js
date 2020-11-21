const options = {
    key: '2677t825ITJyjNOy759Q0ZwJLJvrBmT9',
    verbose: true,

    // Optional: Initial state of the map
    lat: 0,
    lon: 0,
    zoom: 0,
};

// Initialize Windy API
windyInit(options, windyAPI => {
    const { store, map } = windyAPI;

    onChangeMapStyle = (e) => { console.log(e.detail)
        const {styleId, center, zoom} = e.detail
        map.setView(new L.LatLng(center.lat, center.lng), zoom);
        if (styleId === 'mapWinds') {
            store.set('overlay', 'wind');
        } else if (styleId === 'mapTemperatures') {
            store.set('overlay', 'temp');
        }
    }
    
    if (document.addEventListener) {
        document.addEventListener('changeMapStyle', onChangeMapStyle, false);
    } else {
        document.attachEvent('changeMapStyle', onChangeMapStyle);
    }
});