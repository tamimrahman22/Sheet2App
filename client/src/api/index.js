import axios from 'axios'
axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: 'http://localhost:4000/',
});

// app
export const getAppList = () => api.get("app/list");
export const createApp = (payload) => api.post("app/create", payload);
export const getAppById = (id) => api.get(`/app/get/${id}`);

// data source

// views

const apis = {
    getAppList,
    createApp,
    getAppById,
};

export default apis;