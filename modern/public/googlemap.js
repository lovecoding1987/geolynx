window.googlemapLoaded = true;

initGoogleMap = function () {
  const map = new google.maps.Map(document.getElementById('google'), {
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

  const fireIconTemplate = (color) => {
    return [
      '<?xml version="1.0"?>',
      '<svg width="20px" height="20px" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">',
      `<circle stroke="${color}" fill="${color}" opacity="0.7" cx="50" cy="50" r="50"/>`,
      '</svg>'
    ].join('\n');
  }
  

  map.data.setStyle((feature) => {
    let icon = feature.getProperty('icon');
    const colordiff = feature.getProperty('colordiff');

    let zIndex = 0;
    if (icon) zIndex = 500;
    if (!icon && colordiff) {
      var svg = fireIconTemplate(`rgb(255,${255-colordiff},0)`);
      icon = 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(svg)
      zIndex = colordiff
    }
    
    return {
      icon,
      zIndex,
      title: feature.getProperty('description1')
    };
  })

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