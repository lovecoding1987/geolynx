window.googlemapLoaded = true;

window.initGoogleMap = function () {
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


  // map.data.setStyle((feature) => {
  //   if (feature.getProperty('fire')) {
  //     const colordiff = feature.getProperty('colordiff');

  //     const svg = fireIconTemplate(`rgb(255,${255 - colordiff},0)`);

  //     return {
  //       icon: 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(svg),
  //       zIndex: colordiff,
  //       title: feature.getProperty('description1')
  //     };
  //   }

  //   return {
  //     icon: feature.getProperty('icon'),
  //     zIndex: 500
  //   }
  // })

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


ClusterIcon.prototype.createCss = function (pos) {
  const markers = this.cluster_.getMarkers();
  var size = 15;
  if (markers.length < 10) { size = 15; }
  if (markers.length > 10 && markers.length < 100) { size = 22; }
  if (markers.length > 100 && markers.length < 1000) { size = 30; }
  if (markers.length > 1000) { size = 37; }

  const colorR = Math.round(markers.map(m => m.colorR).reduce((total, r) => (total+r)) / markers.length);
  const colorG = Math.round(markers.map(m => m.colorG).reduce((total, g) => (total+g)) / markers.length);
  const colorB = Math.round(markers.map(m => m.colorB).reduce((total, b) => (total+b)) / markers.length);


  style = ['border-radius : 50%',
    'cursor        : pointer',
    'position      : absolute',
    'top           : ' + pos.y + 'px',
    'left          : ' + pos.x + 'px',
    'width         : ' + size * 2 + 'px',
    'height        : ' + size * 2 + 'px',
    'line-height   : ' + (size * 2 + 1) + 'px',
    'text-align    : center',
    `background-color: rgb(${colorR}, ${colorG}, ${colorB})`,
    'opacity       : 0.7',
    'color         : #000000',
    'font-size     : 14px'
  ];
  return style.join(";") + ';';
};