import mapboxgl from 'mapbox-gl';
import {styleOsm} from './mapStyles';


export default class MapView {
    constructor () {
        this.container = document.createElement('div');        
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.position = 'relative';

        this.mapboxContainer = document.createElement('div');
        this.mapboxContainer.id = 'mapbox';
        this.mapboxContainer.style.width = '100%';
        this.mapboxContainer.style.height = '100%';

        this.container.appendChild(this.mapboxContainer);

        this.mapList = {
            'mapbox' : new mapboxgl.Map({
                container: this.mapboxContainer,
                style: styleOsm(),
            })
        }

        this.windyContainer = document.createElement('div');
        this.windyContainer.id = 'windy';
        this.windyContainer.style.width = '100%';
        this.windyContainer.style.height = '100%';

        this.container.appendChild(this.windyContainer); 

        this.map = this.mapList['mapbox'];
    }

    getMap() {
        return this.map;
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
        return this.map.loaded();
    }

    resize() {
        this.map.resize();
    }

    hasImage(name) {
        return this.map.hasImage(name);
    }

    addImage(name, data, option) {
        this.map.addImage(name, data, option);
    }

    setMap(styleId) {
        this.map = this.mapList['mapbox'];
    }
}
