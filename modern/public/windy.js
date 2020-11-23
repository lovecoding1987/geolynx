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

    onChangeMapStyle = (e) => { 
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

    document.dispatchEvent(new CustomEvent('setWindyMap', {
      detail: {
        map: map,
        store: store
      }
    }));


    document.getElementById('bottom').style.zIndex = 400;
    document.getElementById('logo-wrapper').remove();
    document.getElementById('mobile-ovr-select').remove();
    document.getElementById('embed-zoom').remove();
    document.getElementById('windy-app-promo').remove();
});