import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';

import t from './common/localization';
import EditItemView from './EditItemView';
import { Accordion, AccordionSummary, AccordionDetails, makeStyles, Typography, FormControlLabel, Checkbox, RadioGroup, Radio, FormControl, FormLabel } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditAttributesView from './attributes/EditAttributesView';
import deviceAttributes from './attributes/deviceAttributes';
import SelectField from './form/SelectField';
import { deviceCategories } from './common/constants';
import LinkField from './form/LinkField';
import { prefixString } from './common/stringUtils';

const useStyles = makeStyles(() => ({
  details: {
    flexDirection: 'column',
  },
  placeholder: {
    width: '22px',
    height: '22px',
    margin: '2px',
    color: 'white'
  },
}));

const DevicePage = () => {
  const classes = useStyles();

  const [item, setItem] = useState();

  const categories = [];
  deviceCategories.forEach(category => {
    categories.push({
      id: `${category}_blue`,
      name: t(`category${category.replace(/^\w/, c => c.toUpperCase())}`) + ' ' + t('blue'),
      prefixEl: <span style={{ backgroundColor: '#3978b8' }} className={classes.placeholder}></span>
    })
    categories.push({
      id: `${category}_green`,
      name: t(`category${category.replace(/^\w/, c => c.toUpperCase())}`) + ' ' + t('green'),
      prefixEl: <span style={{ backgroundColor: '#156935' }} className={classes.placeholder}></span>
    })
    categories.push({
      id: `${category}_orange`,
      name: t(`category${category.replace(/^\w/, c => c.toUpperCase())}`) + ' ' + t('orange'),
      prefixEl: <span style={{ backgroundColor: '#cc5d2c' }} className={classes.placeholder}></span>
    })
    categories.push({
      id: `${category}_grey`,
      name: t(`category${category.replace(/^\w/, c => c.toUpperCase())}`) + ' ' + t('grey'),
      prefixEl: <span style={{ backgroundColor: '#737373' }} className={classes.placeholder}></span>
    })
  })
  return (
    <EditItemView endpoint="devices" item={item} setItem={setItem}>
      {item &&
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                margin="normal"
                defaultValue={item.name}
                onChange={event => setItem({ ...item, name: event.target.value })}
                label={t('sharedName')}
                variant="filled" />
              <TextField
                margin="normal"
                defaultValue={item.uniqueId}
                onChange={event => setItem({ ...item, uniqueId: event.target.value })}
                label={t('deviceIdentifier')}
                variant="filled" />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedExtra')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              {/* <SelectField
                margin="normal"
                defaultValue={item.groupId}
                onChange={event => setItem({...item, groupId: Number(event.target.value)})}
                endpoint="/api/groups"
                label={t('groupParent')}
                variant="filled" />
              <TextField
                margin="normal"
                defaultValue={item.phone}
                onChange={event => setItem({...item, phone: event.target.value})}
                label={t('sharedPhone')}
                variant="filled" />
              <TextField
                margin="normal"
                defaultValue={item.model}
                onChange={event => setItem({...item, model: event.target.value})}
                label={t('deviceModel')}
                variant="filled" />
              <TextField
                margin="normal"
                defaultValue={item.contact}
                onChange={event => setItem({...item, contact: event.target.value})}
                label={t('deviceContact')}
                variant="filled" /> */}
              <SelectField
                margin="normal"
                defaultValue={item.category}
                onChange={event => setItem({ ...item, category: event.target.value })}
                data={categories}
                label={t('deviceCategory')}
                variant="filled" />
              {/* <FormControl margin="normal">
                <RadioGroup row aria-label="color" defaultValue={item.color} onChange={event => setItem({ ...item, color: event.target.value })}>
                  <FormControlLabel value="blue" label={t('blue')} control={<Radio icon={<span style={{ backgroundColor: '#3978b8' }} className={classes.placeholder}></span>} checkedIcon={<span style={{ backgroundColor: '#3978b8' }} className={`fa fa-check ${classes.placeholder}`}></span>} />} />
                  <FormControlLabel value="green" label={t('green')} control={<Radio icon={<span style={{ backgroundColor: '#156935' }} className={classes.placeholder}></span>} checkedIcon={<span style={{ backgroundColor: '#156935' }} className={`fa fa-check ${classes.placeholder}`}></span>} />} />
                  <FormControlLabel value="orange" label={t('orange')} control={<Radio icon={<span style={{ backgroundColor: '#cc5d2c' }} className={classes.placeholder}></span>} checkedIcon={<span style={{ backgroundColor: '#cc5d2c' }} className={`fa fa-check ${classes.placeholder}`}></span>} />} />
                  <FormControlLabel value="grey" label={t('grey')} control={<Radio icon={<span style={{ backgroundColor: '#737373' }} className={classes.placeholder}></span>} checkedIcon={<span style={{ backgroundColor: '#737373' }} className={`fa fa-check ${classes.placeholder}`}></span>} />} />
                </RadioGroup>
              </FormControl> */}
              <FormControlLabel
                control={<Checkbox checked={item.disabled} onChange={event => setItem({ ...item, disabled: event.target.checked })} />}
                label={t('sharedDisabled')} />
            </AccordionDetails>
          </Accordion>
          {/* <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedAttributes')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <EditAttributesView
                attributes={item.attributes}
                setAttributes={attributes => setItem({...item, attributes})}
                definitions={deviceAttributes}
                />
            </AccordionDetails>
          </Accordion>
          {item.id &&
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  {t('sharedConnections')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <LinkField
                  margin="normal"
                  endpointAll="/api/geofences"
                  endpointLinked={"/api/geofences?deviceId=" + item.id}
                  baseId={item.id}
                  keyBase="deviceId"
                  keyLink="geofenceId"
                  label={t('sharedGeofences')}
                  variant="filled" />
                <LinkField
                  margin="normal"
                  endpointAll="/api/notifications"
                  endpointLinked={"/api/notifications?deviceId=" + item.id}
                  baseId={item.id}
                  keyBase="deviceId"
                  keyLink="notificationId"
                  titleGetter={it => t(prefixString('event', it.type))}
                  label={t('sharedNotifications')}
                  variant="filled" />
              </AccordionDetails>
            </Accordion>
          } */}
        </>
      }
    </EditItemView>
  );
}

export default DevicePage;
