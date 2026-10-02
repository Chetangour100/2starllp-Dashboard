import { createSlice } from "@reduxjs/toolkit";

interface dashboardState {
    dashboardItems: any,
};

const initialState: dashboardState = {
    dashboardItems: [],
};

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        getDashboardData: (state, action) => {
            state.dashboardItems = action.payload;
        },
    }
});

export const { getDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;