import axios from 'axios'
axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: 'http://localhost:4000/',
});

export getAllApps = () => api.get(`/app/list`);

const apis = {
    getAllApps
};

export default apis;