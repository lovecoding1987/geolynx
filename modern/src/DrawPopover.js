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



const useStyles = makeStyles((theme) => ({
    table: {

    },
    formControl: {
        margin: 0,
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

const DrawPopover = ({ id, open, anchorEl, handleClose, data, setMarkerIcon }) => {
    const [symbol, setSymbol] = useState('');
    const classes = useStyles();

    const renderPoint = () => {
        const handleChange = (e) => {
            setSymbol(e.target.value);
            setMarkerIcon(data.id, e.target.value);
        }

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
                        {/* <TableRow>
                            <TableCell component="th" scope="row">Symbol</TableCell>
                            <TableCell align="right">
                                <FormControl className={classes.formControl}>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={symbol}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value={""}>---</MenuItem>
                                        <MenuItem value={"home"}>home</MenuItem>
                                        <MenuItem value={"water"}>water</MenuItem>
                                        <MenuItem value={"tint"}>tint</MenuItem>
                                        <MenuItem value={"faucet"}>faucet</MenuItem>
                                        <MenuItem value={"tint"}>tint</MenuItem>
                                        <MenuItem value={"swimming-pool"}>swimming-pool</MenuItem>
                                        <MenuItem value={"exclamation-circle"}>exclamation-circle</MenuItem>
                                        <MenuItem value={"biohazard"}>biohazard</MenuItem>
                                        <MenuItem value={"skull-crossbones"}>skull-crossbones</MenuItem>
                                        <MenuItem value={"star"}>star</MenuItem>
                                        <MenuItem value={"horse"}>horse</MenuItem>
                                        <MenuItem value={"tree"}>tree</MenuItem>
                                    </Select>
                                </FormControl>
                            </TableCell>
                        </TableRow> */}
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
                    </TableBody>
                </Table>
            </TableContainer>
        )
    }

    const geometryType = data ? data.geometry.type : null;

    return (
        <Popover
            id={id}
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