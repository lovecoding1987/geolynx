initGoogleMap = function () {
    const map = new window.google.maps.Map(document.getElementById('google'), {
        center: { lat: -42.4128, lng: -64.3121 },
        zoom: 4,
        mapTypeControl: false,
        zoomControl: true,
        fullscreenControl: false,
        scaleControl: true,
      });

    document.dispatchEvent(new CustomEvent('setGoogleMap', {
      detail: {
        map: map
      }
    }));



    onShowGoogleMap = (e) => {
        const { oldMapProvider, styleId, center, zoom } = e.detail
    
        map.setMapTypeId(styleId);
        map.setCenter(center);
        map.setZoom(oldMapProvider === 'mapbox' ? zoom + 1 : zoom);
    }
    
    if (document.addEventListener) {
        document.addEventListener('showGoogleMap', onShowGoogleMap, false);
    } else {
        document.attachEvent('showGoogleMap', onShowGoogleMap);
    }
};