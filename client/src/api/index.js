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
export const deleteApp = (payload) => api.post("/app/delete", payload);
export const setAppRoles = (payload) => api.post("/app/setRoles", payload);

// data source
export const addDataSource = (payload) => api.post("/datasource/add", payload); 
export const getDataSourcesByAppId = (id) => api.get(`/datasource/getbyAppId/${id}`);
export const getDataSourceById = (id) => api.get(`/datasource/get/${id}`)
export const getColumns = (payload) => api.post("/datasource/getColumns", payload);
export const getRows = (payload) => api.post("/datasource/getRows", payload);
export const renameDataSource = (payload) => api.post("/datasource/rename", payload);
export const setKeys = (payload) => api.post("/datasource/setKeys", payload);
export const deleteDataSource = (payload) => api.post("/datasource/delete", payload);
export const setInitialValue = (payload) => api.post("/datasource/setInitialValue", payload);
export const setLabel = (payload) => api.post("/datasource/setLabel", payload);
export const setDataSourceRef = (payload) => api.post("/datasource/setDataSourceRef", payload);
export const setColumnRef = (payload) => api.post("/datasource/setColumnRef", payload);

// views
export const getViews = (id) => api.get(`/views/get/${id}`);
export const addView = (payload) => api.post("/views/add", payload);
export const renameView = (payload) => api.post("/views/rename", payload);
export const deleteView = (payload) => api.post("/views/delete", payload);
export const addRecord = (payload) => api.post("/views/addRecord", payload);
export const deleteRecord = (payload) => api.post("/views/deleteRecord", payload);
export const editRecord = (payload) => api.post("/views/editRecord", payload);
export const setViewRoles = (payload) => api.post("/views/setRoles", payload);
export const setViewAllowedActions = (payload) => api.post("/views/setActions", payload);
export const setViewColumns = (payload) => api.post("/views/setColumns", payload);

const apis = {
    getAppList,
    createApp,
    getAppById,
    renameApp,
    publishApp,
    deleteApp,
    setAppRoles,

    addDataSource,
    getDataSourcesByAppId,
    getDataSourceById,
    getColumns,
    getRows,
    renameDataSource,
    setKeys,
    deleteDataSource,
    setInitialValue,
    setLabel,
    setDataSourceRef,
    setColumnRef, 

    getViews,
    addView,
    renameView,
    deleteView,
    addRecord,
    deleteRecord,
    editRecord,
    setViewRoles,
    setViewAllowedActions,
    setViewColumns,
};

export default apis;