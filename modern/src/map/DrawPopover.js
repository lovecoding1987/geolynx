import React, { useState } from 'react';
import Popover from '@material-ui/core/Popover';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import * as turf from '@turf/turf'
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { ColorPicker } from 'material-ui-color';
import { markerSymbols } from '../common/constants';



const useStyles = makeStyles((theme) => ({
    table: {

    },
    formControl: {
        margin: 0,
        minWidth: 120,
        '& input': {
            width: '120px',
            textAlign: 'right'
        }
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

const DrawPopover = ({ open, anchorEl, handleClose, data, changeDrawProperties }) => {
    const classes = useStyles();

    const [properties, setProperties] = useState(data.properties);

    const onChangeProperty = (name, value) => {
        properties[name] = value;
        setProperties({ ...properties });
        changeDrawProperties(data.id, { ...properties });
    }

    const renderPoint = () => {
        return (
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableBody>
                        <TableRow>
                            <TableCell component="th" scope="row">Latitude</TableCell>
                            <TableCell align="right">{data.geometry.coordinates[1].toFixed(4)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Longitude</TableCell>
                            <TableCell align="right">{data.geometry.coordinates[0].toFixed(4)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Symbol</TableCell>
                            <TableCell align="right">
                                <FormControl className={classes.formControl}>
                                    <Select
                                        value={properties['marker-symbol'] || ''}
                                        onChange={e => onChangeProperty('marker-symbol', e.target.value)}
                                    >
                                        <MenuItem value={""}>---</MenuItem>
                                        {markerSymbols.map(symbol => <MenuItem key={symbol.name} value={symbol.icon}>{symbol.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Size</TableCell>
                            <TableCell align="right">
                                <FormControl className={classes.formControl}>
                                    <Select
                                        value={properties['marker-size'] || 'medium'}
                                        onChange={e => onChangeProperty('marker-size', e.target.value)}
                                    >
                                        <MenuItem value={"small"}>Small</MenuItem>
                                        <MenuItem value={"medium"}>Medium</MenuItem>
                                        <MenuItem value={"large"}>Large</MenuItem>
                                    </Select>
                                </FormControl>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Color</TableCell>
                            <TableCell align="right">
                                <FormControl className={classes.formControl}>
                                    <ColorPicker
                                        value={properties['marker-color'] || '#7e7e7e'}
                                        onChange={e => onChangeProperty('marker-color', e.css.backgroundColor)}
                                    />
                                </FormControl>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        )
    }

    const renderPolygon = () => {
        const polygon = turf.polygon(data.geometry.coordinates);

        const area = turf.area(polygon);
        return (
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableBody>
                        <TableRow>
                            <TableCell component="th" scope="row">Sq. Meters</TableCell>
                            <TableCell align="right">{area.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Sq. Kilometers</TableCell>
                            <TableCell align="right">{(area * 1e-6).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Sq. Feet</TableCell>
                            <TableCell align="right">{(area * 10.7639).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Acres</TableCell>
                            <TableCell align="right">{(area * 0.000247105).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Sq. Miles</TableCell>
                            <TableCell align="right">{(area * 3.861e-7).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Stroke</TableCell>
                            <TableCell align="right">
                                <FormControl className={classes.formControl}>
                                    <ColorPicker
                                        value={properties['stroke'] || '#D20C0C'}
                                        onChange={e => onChangeProperty('stroke', e.css.backgroundColor)}
                                    />
                                </FormControl>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Stroke Width</TableCell>
                            <TableCell align="right">
                                <FormControl className={classes.formControl}>
                                    <TextField
                                        type="Number"
                                        inputProps={{min: 1, max: 10, step: 0.1}}
                                        value={properties['stroke-width'] || 2}
                                        onChange={e => onChangeProperty('stroke-width', parseFloat(e.target.value))}
                                    />
                                </FormControl>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Fill</TableCell>
                            <TableCell align="right">
                                <FormControl className={classes.formControl}>
                                    <ColorPicker
                                        value={properties['fill'] || '#D20C0C'}
                                        onChange={e => onChangeProperty('fill', e.css.backgroundColor)}
                                    />
                                </FormControl>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Fill Opacity</TableCell>
                            <TableCell align="right">
                                <FormControl className={classes.formControl}>
                                    <TextField
                                        type="Number"
                                        inputProps={{min:0, max:1, step:0.1}}
                                        value={properties['fill-opacity'] || 0.1}
                                        onChange={e => onChangeProperty('fill-opacity', parseFloat(e.target.value))}
                                    />
                                </FormControl>
                            </TableCell>
                        </TableRow>

                    </TableBody>
                </Table>
            </TableContainer>
        )
    }

    const renderLineString = () => {
        const line = turf.lineString(data.geometry.coordinates);

        return (
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableBody>
                        <TableRow>
                            <TableCell component="th" scope="row">Meters</TableCell>
                            <TableCell align="right">{turf.length(line, { units: 'meters' }).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Kilometers</TableCell>
                            <TableCell align="right">{turf.length(line, { units: 'kilometers' }).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Feet</TableCell>
                            <TableCell align="right">{turf.length(line, { units: 'feet' }).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Yards</TableCell>
                            <TableCell align="right">{turf.length(line, { units: 'yards' }).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Miles</TableCell>
                            <TableCell align="right">{turf.length(line, { units: 'miles' }).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Stroke</TableCell>
                            <TableCell align="right">
                                <FormControl className={classes.formControl}>
                                    <ColorPicker
                                        value={properties['stroke'] || '#D20C0C'}
                                        onChange={e => onChangeProperty('stroke', e.css.backgroundColor)}
                                    />
                                </FormControl>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Stroke Width</TableCell>
                            <TableCell align="right">
                                <FormControl className={classes.formControl}>
                                    <TextField
                                        type="Number"
                                        inputProps={{min:1, max:10, step:0.1}}
                                        value={properties['stroke-width'] || 2}
                                        onChange={e => onChangeProperty('stroke-width', parseFloat(e.target.value))}
                                    />
                                </FormControl>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        )
    }

    const geometryType = data ? data.geometry.type : null;

    return (
        <Popover
            id={data.id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            {geometryType === 'Point' && renderPoint()}
            {geometryType === 'Polygon' && renderPolygon()}
            {geometryType === 'LineString' && renderLineString()}
        </Popover>
    )
}

export default DrawPopover;