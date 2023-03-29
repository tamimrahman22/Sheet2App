import axios from 'axios'
axios.defaults.withCredentials = true;

const api = axios.create({
    baseURL: 'http://localhost:4000/',
});

// app
export const getAppList = (payload) => api.post("app/list", payload);
export const createApp = (payload) => api.post("app/create", payload);
export const getAppById = (id) => api.get(`/app/get/${id}`);
export const renameApp = (payload) => api.post("/app/rename", payload);
export const publishApp = (payload) => api.post("/app/publish", payload);

// data source

// views

const apis = {
    getAppList,
    createApp,
    getAppById,
    renameApp,
    publishApp,
};

export default apis;