import csv_parse from 'csv-parse'
import { colorByMonth } from './mapUtil';

export const fetchFIRMS = (id, time) => {
    let url
    switch (id) {
        case 'MODIS':
            url = `/data/active_fire/c6/csv/MODIS_C6_South_America${time}.csv`;
            break;
        case 'VIIRS-S-NPP':
            url = `/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_America${time}.csv`;
            break;
        case 'VIIRS-NOAA-20':
            url = `/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_America${time}.csv`;
            break;
        default:
            return;
    }
    return new Promise((resolve, reject) => {
        return fetch(url).then((res) => res.text().then((data) => csv_parse(data.trim(), {
            columns: true,
            from_line: 1
        }, function (err, records) {
            if (err) return reject(err);

            return resolve(records.map(r => ({ ...r, type: id })));
        })))
    })
}

export const fetchOldFIRMS = (country, year, month) => {
    const url = `/firms/hot_spots/${year}/modis_${year}_${country}_${month}.csv`;

    return new Promise(resolve =>
        fetch(url)
            .then((res) => (
                res.text().then((data) => csv_parse(data.trim(), {
                    columns: true,
                    from_line: 1
                }, function (err, records) {
                    if (err) return resolve([]);
    
                    return resolve(records.map(r => ({ ...r, type: 'modis', old: true })));
                }))
            ))
            .catch(e => resolve([]))
    )
}

export const fetchBurnedData = (country, year, month) => {
    const url = `/firms/burned_area/${country}/${year}/${country}_${year}_${month}.geojson`;

    return new Promise(resolve => fetch(url)
        .then(res => res.json().then(data => {
            data.features.forEach(feature => feature.properties = {...feature.properties, color: colorByMonth(month)})
            return resolve(data.features)
        }))
        .catch(e => resolve([])))
}