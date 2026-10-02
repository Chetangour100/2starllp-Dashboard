import { combineReducers } from "@reduxjs/toolkit";
import storage from 'redux-persist/lib/storage';
import { persistReducer } from "redux-persist";
import authSlice from "../features/authSlice"
import dashboardSlice from "../features/dashboardSlice";
import loaderSlice from "../features/loaderSlice";

const rootReducers = combineReducers({
    auth: authSlice,
    dashboard: dashboardSlice,
    isLoader: loaderSlice,
});

const persisteConfig = {
    key: "root",
    versions: "1",
    storage,
};

const persistedReducer = persistReducer(persisteConfig, rootReducers);
export default persistedReducer;