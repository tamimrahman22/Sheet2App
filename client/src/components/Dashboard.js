import React, { useEffect } from 'react'
import axios from 'axios'
axios.defaults.withCredentials = true;
// import api from '../api'

function Dashboard() {
    // const { store } = useContext(GlobalStoreContext);
    const api = axios.create({
        baseURL: 'http://localhost:4000/',
    });
    let list = api.get(`/app/list`);
    // let list = await axios.get("http://localhost:4000/app/list");
    // let list = api.getAllApps;
    console.log(list);
    
    return (
        // console.log(list);
        <div>
          <h2>List of Information:</h2>
          {/* <ul>
            {list.map((info) => (
              <li key={info.id}>{info.name}</li>
            ))}
          </ul> */}
        </div>
      );
}

export default Dashboard;