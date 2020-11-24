import mapboxgl from 'mapbox-gl';
import { styleOsm } from './mapStyles';
import { deviceCategories, firmsCategories } from '../common/icons';
import { loadMapImage } from './mapUtil';



export const initMapboxMap = async (map) => {

    await Promise.all(deviceCategories.map(async category => {
        if (!map.hasImage(`${category}_blue`)) map.addImage(`${category}_blue`, await loadMapImage(map, `images/icon/${category}_blue.png`), { pixelRatio: window.devicePixelRatio });
        if (!map.hasImage(`${category}_green`)) map.addImage(`${category}_green`, await loadMapImage(map, `images/icon/${category}_green.png`), { pixelRatio: window.devicePixelRatio });
        if (!map.hasImage(`${category}_grey`)) map.addImage(`${category}_grey`, await loadMapImage(map, `images/icon/${category}_grey.png`), { pixelRatio: window.devicePixelRatio });
        if (!map.hasImage(`${category}_orange`)) map.addImage(`${category}_orange`, await loadMapImage(map, `images/icon/${category}_orange.png`), { pixelRatio: window.devicePixelRatio });
    }));

    await Promise.all(firmsCategories.map(async category => {
        const imagename = `fire_${category}`; 
        if (!map.hasImage(imagename)) map.addImage(imagename, await loadMapImage(map, `images/${imagename}.png`), { pixelRatio: window.devicePixelRatio });        
    }));
};

export default class MapView {
    constructor() {
        this.container = document.createElement('div');
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.position = 'relative';

        this.mapboxContainer = document.createElement('div');
        this.mapboxContainer.id = 'mapbox';
        this.mapboxContainer.style.width = '100%';
        this.mapboxContainer.style.height = '100%';

        this.container.appendChild(this.mapboxContainer);

        this.mapboxMap = new mapboxgl.Map({
            container: this.mapboxContainer,
            style: styleOsm(),
            animate: false
        });

        this.mapboxMap.on('load', () => initMapboxMap(this.mapboxMap));

        this.windyContainer = document.createElement('div');
        this.windyContainer.id = 'windy';
        this.windyContainer.style.width = '100%';
        this.windyContainer.style.height = '100%';

        this.container.appendChild(this.windyContainer);

        this.map = this.mapboxMap

        this.mapProvider = 'mapbox'
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
        this.map.resize();
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
        } else if (styleId === 'mapGoogle') {
            this.map = this.googleMap;
            this.mapProvider = 'google';
        } else {
            this.map = this.mapboxMap;
            this.mapProvider = 'mapbox';
        }
    }

    getZoom() {
        return this.map.getZoom()
    }

    getCenter() {
        return this.map.getCenter()
    }

    setWindyMap(map) {
        this.windyMap = map;
    }

    setWindyStore(store) {
        this.windyStore = store;
    }

    setMapProvider(provider) {
        this.mapProvider = provider;
    }
}
