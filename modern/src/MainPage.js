import React from 'react';
import { isWidthUp, makeStyles, withWidth } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import Fab from '@material-ui/core/Fab';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import ContainerDimensions from 'react-container-dimensions';
import DevicesList from './DevicesList';
import MainToolbar from './MainToolbar';
import Map from './map/Map';
import SelectedDeviceMap from './map/SelectedDeviceMap';
import AccuracyMap from './map/AccuracyMap';
import GeofenceMap from './map/GeofenceMap';
import CurrentPositionsMap from './map/CurrentPositionsMap';
import CurrentLocationMap from './map/CurrentLocationMap';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column-reverse',
    }
  },
  drawerPaper: {
    position: 'relative',
    [theme.breakpoints.up('sm')]: {
      width: 350,
    },
    [theme.breakpoints.down('xs')]: {
      height: 250,
    }
  },
  mapContainer: {
    flexGrow: 1,
  },
}));

const MainPage = ({ width }) => {
  const classes = useStyles();
  const [state, setState] = React.useState({
    openDevicesList: false
  });

  const anchor = isWidthUp('sm', width) ? 'left' : 'bottom';


  const toggleDevicesList = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, openDevicesList: open });
  };

  const fabStyle = {
      margin: 0,
      top: '50%',
      left: -20,
      position: 'fixed',
      zIndex: 1199,
      paddingLeft: 10,
      opacity: 0.6
  }
  return (
    <div className={classes.root}>
      <MainToolbar />
      <div className={classes.content}>
        <Fab size="small" color="primary" aria-label="add" onClick={toggleDevicesList(true)} style={fabStyle}>
          <ArrowForwardIosIcon />
        </Fab>
        <Drawer
          anchor={anchor}
          open={state.openDevicesList} 
          onClose={toggleDevicesList(false)}
          classes={{ paper: classes.drawerPaper }}>
          <DevicesList />
        </Drawer>
        <div className={classes.mapContainer}>
          <ContainerDimensions>
            <Map>
              <CurrentLocationMap />
              <GeofenceMap />
              <AccuracyMap />
              <CurrentPositionsMap />
              <SelectedDeviceMap />
            </Map>
          </ContainerDimensions>
        </div>
      </div>
    </div>
  );
}

export default withWidth()(MainPage);
