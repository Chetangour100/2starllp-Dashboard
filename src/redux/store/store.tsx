// import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "../features/authSlice";

// export const store = configureStore({
//     reducer: {
//         auth: authReducer,
//         // dashbaord: "",
//     }
// });

// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch;



import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from 'redux-persist';
import persistedReducer from "./persistedReducer";

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            }
        })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;