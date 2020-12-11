import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { sessionReducer as session } from './session';
import { devicesReducer as devices } from './devices';
import { positionsReducer as positions } from './positions';
import { firesReducer as fires } from './fires';

const reducer = combineReducers({
  session,
  devices,
  positions,
  fires,
});

export { sessionActions } from './session';
export { devicesActions } from './devices';
export { positionsActions } from './positions';
export { firesActions } from './fires';

export default configureStore({ 
  reducer
 });
