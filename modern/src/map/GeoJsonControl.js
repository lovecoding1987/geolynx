import { downloadGeoJson } from './mapUtil';
import t from '../common/localization';
export default class GeoJsonControl {
    constructor(draw) {
        this.draw = draw;
    }

    onAdd(map) {
        this._map = map;
        this.controlContainer = document.createElement('div');
        this.controlContainer.classList.add('mapboxgl-ctrl');
        this.controlContainer.classList.add('mapboxgl-ctrl-group');

        this.downloadButton = document.createElement('button');
        this.downloadButton.type = 'button';
        this.downloadButton.classList.add('mapboxgl-ctrl-icon');
        this.downloadButton.innerHTML = '<i class="fa fa-download"></i>';
        this.downloadButton.title = t('download_geojson');
        this.downloadButton.addEventListener('click', () => {
            downloadGeoJson(this.draw.getAll(), 'geojson.json')
        });

        this.controlContainer.appendChild(this.downloadButton);

        this.uploadButton = document.createElement('button');
        this.uploadButton.type = 'button';
        this.uploadButton.classList.add('mapboxgl-ctrl-icon');
        this.uploadButton.innerHTML = '<i class="fa fa-upload"></i>';
        this.uploadButton.title = t('upload_geojson');
        this.uploadButton.addEventListener('click', () => {
            document.getElementById('upload-geojson-file').click();
        });

        this.controlContainer.appendChild(this.uploadButton);

        this.uploadInput = document.createElement('input');
        this.uploadInput.id = 'upload-geojson-file';
        this.uploadInput.type = 'file';
        this.uploadInput.hidden = true;
        this.uploadInput.accept = '.json';
        
        this.uploadInput.addEventListener('change', async (event) => {
            const file = event.target.files.item(0);

            try {
                const geojson = JSON.parse(await file.text());
                if (geojson.features) {
                    geojson.features.forEach((feature) => {
                        this.draw.add(feature);
                    })
                }
            } catch (e) {

            }
            
            
        })
    
        this.controlContainer.appendChild(this.uploadInput);

        return this.controlContainer;
    }

    onRemove() {
        this.controlContainer.parentNode.removeChild(this.controlContainer);
        this._map = undefined;
    }
}