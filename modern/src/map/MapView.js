import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { styleOsm } from './mapStyles';
import { deviceCategories, markerIcons } from '../common/constants';
import { loadMapImage, mapDrawStyles } from './mapUtil';
import GeoJsonControl from './GeoJsonControl';



export const initMapboxMap = async (map, onLoaded) => {
    await Promise.all(deviceCategories.map(async category => {
        if (!map.hasImage(`${category}_blue`)) map.addImage(`${category}_blue`, await loadMapImage(map, `images/icon/${category}_blue.png`), { pixelRatio: window.devicePixelRatio });
        if (!map.hasImage(`${category}_green`)) map.addImage(`${category}_green`, await loadMapImage(map, `images/icon/${category}_green.png`), { pixelRatio: window.devicePixelRatio });
        if (!map.hasImage(`${category}_grey`)) map.addImage(`${category}_grey`, await loadMapImage(map, `images/icon/${category}_grey.png`), { pixelRatio: window.devicePixelRatio });
        if (!map.hasImage(`${category}_orange`)) map.addImage(`${category}_orange`, await loadMapImage(map, `images/icon/${category}_orange.png`), { pixelRatio: window.devicePixelRatio });
    }));

    await Promise.all(markerIcons.map(async icon => {
        if (!map.hasImage(`marker-${icon}`)) map.addImage(`marker-${icon}`, await loadMapImage(map, `images/marker_${icon}.png`));
    }));

    if (!map.hasImage('marker-default')) map.addImage('marker-default', await loadMapImage(map, 'images/marker.png'));

    if (onLoaded) onLoaded();
};

export default class MapView {
    constructor() {
        // Add map container
        this.container = document.createElement('div');
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.position = 'relative';

        // Add google map container
        this.googleContainer = document.createElement('div');
        this.googleContainer.id = 'google';
        this.googleContainer.style.width = '100%';
        this.googleContainer.style.height = '100%';
        this.container.appendChild(this.googleContainer);

        // Add mapbox map container
        this.mapboxContainer = document.createElement('div');
        this.mapboxContainer.id = 'mapbox';
        this.mapboxContainer.style.width = '100%';
        this.mapboxContainer.style.height = '100%';
        this.container.appendChild(this.mapboxContainer);

        // Add windy map container
        this.windyContainer = document.createElement('div');
        this.windyContainer.id = 'windy';
        this.windyContainer.style.width = '100%';
        this.windyContainer.style.height = '100%';
        this.container.appendChild(this.windyContainer);


        this.center = [-64.3121, -42.4128];
        this.zoom = 3;
        this.initializeMapboxMap();
    }

    initializeMapboxMap() {
        mapboxgl.accessToken = 'pk.eyJ1IjoiaW5jbGFuZnVuayIsImEiOiJja2dlNnM3MGIwNm4zMnlwaHo3M3J2bzU4In0.LUlcK4IiLIEY_ssxmzXgKQ';
        this.mapboxMap = new mapboxgl.Map({
            container: this.mapboxContainer,
            style: styleOsm(),
            animate: false,
            center: this.center,
            zoom: this.zoom
        });

        this.mapboxMap.on('load', () => initMapboxMap(this.mapboxMap, this.onLoadedMapboxMap));


        this.mapboxDraw = new MapboxDraw({
            controls: {
                combine_features: false,
                uncombine_features: false,
            },
            userProperties: true,
            styles: mapDrawStyles
        });
        this.mapboxMap.addControl(new mapboxgl.NavigationControl({
            showCompass: false,
        }));
        this.mapboxMap.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true,
                timeout: 5000,
            },
            trackUserLocation: true,
        }));
        this.mapboxMap.addControl(this.mapboxDraw);
        this.mapboxMap.addControl(new GeoJsonControl(this.mapboxDraw));

        this.map = this.mapboxMap

        this.mapProvider = 'mapbox'
    }

    initializeGoogleMap() {
        
    }

    getMap() {
        switch (this.mapProvider) {
            case 'windy': return this.windyMap;
            case 'google': return this.googleMap;
            case 'mapbox':
            default:
                return this.mapboxMap;
        }
    }

    getContainer() {
        return this.container;
    }

    on(eventName, eventListener) {
        this.map.on(eventName, eventListener);
    }

    addControl(control) {
        const controlContainer = control.onAdd(this)
        this.container.appendChild(controlContainer);
    }

    loaded() {
        if (this.mapProvider === 'mapbox')
            return this.map.loaded();

        return true;
    }

    resize() {
        if (this.map instanceof mapboxgl.Map) {
            this.map.resize();
        }
    }

    hasImage(name) {
        if (this.mapProvider === 'mapbox')
            return this.map.hasImage(name);

        return true;
    }

    addImage(name, data, option) {
        if (this.mapProvider !== 'mapbox') return;
        this.map.addImage(name, data, option);
    }

    setMapByStyle(styleId) {
        if (styleId === 'mapWinds' || styleId === 'mapTemperatures') {
            this.map = this.windyMap;
            this.mapProvider = 'windy';
        } else if (styleId === 'mapGoogleSatellite' || styleId === 'mapGoogleHybrid') {
            this.map = this.googleMap;
            this.mapProvider = 'google';
        } else {
            this.map = this.mapboxMap;
            this.mapProvider = 'mapbox';
        }

        this.mapStyleId = styleId;
    }

    getZoom() {
        return this.map.getZoom()
    }

    getCenter() {
        if (this.mapProvider === 'google') return {lat: this.map.getCenter().lat(), lng: this.map.getCenter().lng()}
        return this.map.getCenter()
    }

    setWindyMap(map) {
        this.windyMap = map;
    }

    setWindyStore(store) {
        this.windyStore = store;
    }

    setGoogleMap(map) {
        this.googleMap = map; 
    }
    setMapProvider(provider) {
        this.mapProvider = provider;
    }
}
