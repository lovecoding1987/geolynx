import isEqual from 'lodash/isEqual';
import { createSlice } from '@reduxjs/toolkit';

const { reducer, actions } = createSlice({
    name: 'fires',
    initialState: {
        data: {
            _24h: {},
            _48h: {},
            _7d: {},
        },
        times: [],
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
            if (state.times.indexOf(time) < 0) state.times.push(time);
        },
        selectTimes(state, action) {
            const times = action.payload;
            times.forEach(time => {
                if (state.times.indexOf(time) < 0) state.times.push(time);
            })
        },
        deselectTime(state, action) {
            const time = action.payload
            const index = state.times.indexOf(time);
            if (index > -1) {
                state.times.splice(index, 1);
            }
        },
        deselectAllTimes(state, action) {
            state.times = [];
        },
        setLoading(state, action) {
            state.loading = action.payload;            
        }
    }
});

export { actions as firesActions };
export { reducer as firesReducer };
