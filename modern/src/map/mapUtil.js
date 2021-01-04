export const loadMapImage = (map, url) => new Promise((resolve, reject) => {
  map.loadImage(url, function (err, image) {
    if (err) return reject(err);

    resolve(image)
  })
})

export const loadImage = (url) => {
  return new Promise(imageLoaded => {
    const image = new Image();
    image.onload = () => imageLoaded(image);
    image.src = url;
  });
};

export const loadIcon = async (key, background, url) => {
  const image = await loadImage(url);
  const pixelRatio = window.devicePixelRatio;

  const canvas = document.createElement('canvas');
  canvas.width = background.width * pixelRatio;
  canvas.height = background.height * pixelRatio;
  canvas.style.width = `${background.width}px`;
  canvas.style.height = `${background.height}px`;

  const context = canvas.getContext('2d');
  context.drawImage(background, 0, 0, canvas.width, canvas.height);

  const iconRatio = 0.5;
  const imageWidth = canvas.width * iconRatio;
  const imageHeight = canvas.height * iconRatio;
  context.drawImage(image, (canvas.width - imageWidth) / 2, (canvas.height - imageHeight) / 2, imageWidth, imageHeight);

  return context.getImageData(0, 0, canvas.width, canvas.height);
};

export const reverseCoordinates = it => {
  if (!it) {
    return it;
  } else if (Array.isArray(it)) {
    if (it.length === 2 && !Number.isNaN(it[0]) && !Number.isNaN(it[1])) {
      return [it[1], it[0]];
    } else {
      return it.map(it => reverseCoordinates(it));
    }
  } else {
    return {
      ...it,
      coordinates: reverseCoordinates(it.coordinates),
    }
  }
}

export const downloadGeoJson = (data, filename) => {
  var file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/jsons' });
  if (window.navigator.msSaveOrOpenBlob) // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

export const loadSymbolImage = async (map, properties) => {
  const marker_size = properties['marker-size'] ? properties['marker-size'].substr(0, 1) : 'm';
  const marker_symbol = properties['marker-symbol'] ? '-' + properties['marker-symbol'] : '';
  const marker_color = properties['marker-color'] ? properties['marker-color'].substr(1) : '7e7e7e';
  const icon = `${marker_size}${marker_symbol}+${marker_color}`;
  if (!map.hasImage(icon)) {
    const image = await loadMapImage(map, `https://a.tiles.mapbox.com/v4/marker/pin-${icon}.png?access_token=pk.eyJ1IjoiaW5jbGFuZnVuayIsImEiOiJja2dlNnM3MGIwNm4zMnlwaHo3M3J2bzU4In0.LUlcK4IiLIEY_ssxmzXgKQ`);
    map.addImage(icon, image);
  }
}
export const mapDrawStyles = [
  // ============ Point ==============
  {
    'id': 'marker-default-active',
    'type': 'symbol',
    'layout': {
      'icon-image': [
        'image', [
          'concat',
          ['case', ['==', ['has', 'user_marker-size'], true], ['slice', ['get', 'user_marker-size'], 0, 1], 'm'],
          ['case', ['==', ['all', ['has', 'user_marker-symbol'], ['!=', ['get', 'user_marker-symbol'], '']], true], '-', ''],
          ['case', ['==', ['all', ['has', 'user_marker-symbol'], ['!=', ['get', 'user_marker-symbol'], '']], true], ['get', 'user_marker-symbol'], ''],
          '+',
          ['case', ['==', ['has', 'user_marker-color'], true], ['slice', ['get', 'user_marker-color'], 1], '7e7e7e']
        ]
      ],
      'icon-allow-overlap': true
    },
    'filter': [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['==', 'active', 'true']
    ]
  },
  {
    'id': 'marker-default-inactive',
    'type': 'symbol',
    'layout': {
      'icon-image': [
        'image', [
          'concat',
          ['case', ['==', ['has', 'user_marker-size'], true], ['slice', ['get', 'user_marker-size'], 0, 1], 'm'],
          ['case', ['==', ['all', ['has', 'user_marker-symbol'], ['!=', ['get', 'user_marker-symbol'], '']], true], '-', ''],
          ['case', ['==', ['all', ['has', 'user_marker-symbol'], ['!=', ['get', 'user_marker-symbol'], '']], true], ['get', 'user_marker-symbol'], ''],
          '+',
          ['case', ['==', ['has', 'user_marker-color'], true], ['slice', ['get', 'user_marker-color'], 1], '7e7e7e']
        ]
      ],
      'icon-allow-overlap': true
    },
    'filter': [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['==', 'active', 'false']
    ],
  },
  // ========== LineString ===========
  // ACTIVE (being drawn)
  {
    "id": "gl-draw-line",
    "type": "line",
    "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": ['coalesce', ['get', 'user_stroke'], "#D20C0C"],
      "line-dasharray": [0.2, 2],
      "line-width": ['coalesce', ['get', 'user_stroke-width'], 2]
    }
  },
  // INACTIVE (static, already drawn)
  {
    "id": "gl-draw-line-static",
    "type": "line",
    "filter": ["all", ["==", "$type", "LineString"], ["==", "mode", "static"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#000",
      "line-width": 3
    }
  },
  // ============ Polygon ===========
  // polygon fill
  {
    "id": "gl-draw-polygon-fill",
    "type": "fill",
    "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    "paint": {
      "fill-color": ['coalesce', ['get', 'user_fill'], "#D20C0C"],
      "fill-outline-color": ['coalesce', ['get', 'user_stroke'], "#D20C0C"],
      "fill-opacity": 0.1
    }
  },
  // polygon outline stroke
  // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
  {
    "id": "gl-draw-polygon-stroke-active",
    "type": "line",
    "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": ['coalesce', ['get', 'user_stroke'], "#D20C0C"],
      "line-dasharray": [0.2, 2],
      "line-width": ['coalesce', ['get', 'user_stroke-width'], 2]
    }
  },
  // INACTIVE (static, already drawn)
  // polygon fill
  {
    "id": "gl-draw-polygon-fill-static",
    "type": "fill",
    "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    "paint": {
      "fill-color": "#000",
      "fill-outline-color": "#000",
      "fill-opacity": 0.1
    }
  },
  // polygon outline
  {
    "id": "gl-draw-polygon-stroke-static",
    "type": "line",
    "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#000",
      "line-width": 3
    }
  },
  // vertex point halos
  {
    "id": "gl-draw-polygon-and-line-vertex-halo-active",
    "type": "circle",
    "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
    "paint": {
      "circle-radius": 5,
      "circle-color": "#FFF"
    }
  },
  // vertex points
  {
    "id": "gl-draw-polygon-and-line-vertex-active",
    "type": "circle",
    "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
    "paint": {
      "circle-radius": 3,
      "circle-color": "#D20C0C",
    }
  }
]

export const colorByMonth = (month) => {
  switch (month) {
    case 1:
    case 'Jan':
      return '#800000';
    case 2:
    case 'Feb':
      return '#e6194b';
    case 3:
    case 'Mar':
      return '#f58230';
    case 4:
    case 'Apr':
      return '#ffe119';
    case 5:
    case 'May':
      return '#d2f53c';
    case 6:
    case 'Jun':
      return '#3cb44b';
    case 7:
    case 'Jul':
      return '#46f0f0';
    case 8:
    case 'Aug':
      return '#0082c8';
    case 9:
    case 'Sep':
      return '#911eb4';
    case 10:
    case 'Oct':
      return '#f032e6';
    case 11:
    case 'Nov':
      return '#808080';
    case 12:
    case 'Dec':
      return '#000000';
  }
}

export const colorByHoursDiff = (hoursDiff) => {
  if (hoursDiff < 2) return '#ea3231';
  if (2 <= hoursDiff && hoursDiff < 4) return '#ea5132';
  if (4 <= hoursDiff && hoursDiff < 6) return '#eb7032';
  if (6 <= hoursDiff && hoursDiff < 8) return '#eb8f33';
  if (8 <= hoursDiff && hoursDiff < 10) return '#ecae34';
  if (10 <= hoursDiff && hoursDiff < 12) return '#edcd35';
  if (12 <= hoursDiff && hoursDiff < 14) return '#edec35';
  if (14 <= hoursDiff && hoursDiff < 16) return '#d0ed36';
  if (16 <= hoursDiff && hoursDiff < 18) return '#b3ee37';
  if (18 <= hoursDiff && hoursDiff < 20) return '#95ee38';
  if (20 <= hoursDiff && hoursDiff < 22) return '#5af039';
  return '#3df03a';
}