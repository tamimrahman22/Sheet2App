import axios from 'axios'
axios.defaults.withCredentials = true;

const api = axios.create({
    baseURL: 'http://localhost:4000',
});

// app
export const getAppList = (payload) => api.post("/app/list", payload);
export const createApp = (payload) => api.post("/app/create", payload);
export const getAppById = (id) => api.get(`/app/get/${id}`);
export const renameApp = (payload) => api.post("/app/rename", payload);
export const publishApp = (payload) => api.post("/app/publish", payload);

// data source
export const addDataSource = (payload) => api.post("/datasource/add", payload); 
export const getDataSourcesByAppId = (id) => api.get(`/datasource/getbyAppId/${id}`);
export const getDataSourceById = (id) => api.get(`/datasource/get/${id}`)
export const getColumns = (payload) => api.post("/datasource/getColumns", payload);
export const getRows = (payload) => api.post("/datasource/getRows", payload);

// views
export const getViews = (id) => api.get(`/views/get/${id}`);
export const addView = (payload) => api.post("/views/add", payload);

const apis = {
    getAppList,
    createApp,
    getAppById,
    renameApp,
    publishApp,

    addDataSource,
    getDataSourcesByAppId,
    getDataSourceById,
    getColumns,
    getRows,

    getViews,
    addView,
};

export default apis;