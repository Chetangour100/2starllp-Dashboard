import { createSlice } from "@reduxjs/toolkit";

interface loaderState {
    isLoader: boolean,
};

const initialState: loaderState = {
    isLoader: false,
};

const loaderSlice = createSlice({
    name: "globalLoader",
    initialState,
    reducers: {
        startLoader: (state, action) => {
            state.isLoader = action.payload;
        },
        stopLoader: (state, action) => {
            state.isLoader = action.payload;
        }
    }
});

export const { startLoader, stopLoader } = loaderSlice.actions;
export default loaderSlice.reducer;