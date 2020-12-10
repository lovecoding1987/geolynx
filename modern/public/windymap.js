window.windymapLoaded = true;
// Initialize Windy API
windyInit({
    key: '2677t825ITJyjNOy759Q0ZwJLJvrBmT9',
    verbose: false,

    // Optional: Initial state of the map
    lat: 0,
    lon: 0,
    zoom: 0,
}, windyAPI => {
    const { store, map, picker, utils, overlays } = windyAPI;

    overlays.wind.setMetric('km/h')
    map.on('click', function(e) {
        const {lat, lng} = e.latlng;
        picker.open({ lat: lat, lon: lng });
    })

    onShowWindyMap = (e) => { 
        const {oldMapProvider, styleId, center, zoom} = e.detail; 
        map.setView(new L.LatLng(center.lat, center.lng), oldMapProvider === 'mapbox' ? zoom + 1 : zoom);
        if (styleId === 'mapWinds') {
            store.set('overlay', 'wind');
        } else if (styleId === 'mapTemperatures') {
            store.set('overlay', 'temp');
        }
    }
    
    if (document.addEventListener) {
        document.addEventListener('showWindyMap', onShowWindyMap, false);
    } else {
        document.attachEvent('showWindyMap', onShowWindyMap);
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