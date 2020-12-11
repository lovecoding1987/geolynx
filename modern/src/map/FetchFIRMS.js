import parse from 'csv-parse'

export const fetchFIRMS = (id, time) => {
    let url
    switch(id) {
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
        return fetch(url).then((res) => res.text().then((data) => parse(data.trim(), {
            columns: true,
            from_line: 1
        }, function (err, records) {
            if (err) return reject(err);

            return resolve(records.map(r => ({...r, title: id})));
        })))
    })
}