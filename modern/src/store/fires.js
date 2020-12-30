import isEqual from 'lodash/isEqual';
import { createSlice } from '@reduxjs/toolkit';

const { reducer, actions } = createSlice({
    name: 'fires',
    initialState: {
        data: {
            _24h: {},
            _48h: {},
            _7d: {},
            _old_burn: {},
            _old_burned: []
        },
        time: '',
        loading: false
    },
    reducers: {
        updateData(state, action) {
            const { time, items } = action.payload;
            if (!isEqual(state.data[time], items)) {
                state.data[time] = items;
            }
        },
        selectTime(state, action) {
            const time = action.payload;
            state.time = time
        },
        deselectTime(state, action) {
            const time = action.payload;
            state.time = null;
        },
        setLoading(state, action) {
            state.loading = action.payload;            
        }
    }
});

export { actions as firesActions };
export { reducer as firesReducer };
