import { createContext, useState } from "react";
import { useNavigate } from 'react-router-dom';
import api from '../../api'

const GlobalContext = createContext();
console.log('Creating store context...')

export function GlobalContextProvider({children}){

    const navigate = useNavigate();

    // GLOBAL STATE OF THE APPLICATION 
    const [appList, setAppList] = useState([]); 
    const [currentAppID, setCurrentAppID] = useState(null);

    // Functions to be used to manipulate the global state of our application 

    // This function will load the lists of the current user.   
    const loadAppList = function(){
        async function getLists() {    
            const response = await api.getAppList();
            console.log('[STORE] Response: ', response);
            console.log('[STORE] Data: ',  response.data);
            // Set the app list with the new lists that were found! 
            setAppList(response.data);
            // // Push the dashboard to show the new app being made! 
            // navigate('/dashboard', { replace: true })
          }
        getLists();
    }

    // This function is for creating an application to S2A for the user. 
    const createApp = function(appName, userEmail, roleSheet){
        async function createApplication (appName, userEmail, roleSheet){
            let payload = {
                // Get the name of the app
                name: appName,
                // Using who is logged in, use the email of the user as the creator of this application 
                creator: userEmail,
                // This is the URL to that is going to be used to define the roles of the app. 
                roleMembershipSheet: roleSheet,
            };
            console.log('[STORE] Creating application... sending: ',payload)
            // Send the request with the payload and wait for a response back. 
            const response = await api.createApp(payload);
            console.log('[STORE] Created application...', response)
            // After application has been created, reload the app list. 
            navigate('/dashboard', { replace: true })
        }
        createApplication(appName, userEmail, roleSheet)
    }

    // THE API CALL IS LOWKEY UNNECESSARY
    const setCurrentApp = function(id) {
        async function setAppId(id) { 
            const response = await api.getAppById(id);
            console.log('[STORE] Getting application...', response);
            if (response.status === 200) {
                setCurrentAppID(id);
            }
        }
        setAppId(id);
    }

    // IF THIS GETS BIG WE MIGHT NEED A REDUCER
    const funcs = {
        appList, 
        setAppList, 
        currentAppID, 
        setCurrentAppID, 
        loadAppList, 
        createApp,
        setCurrentApp,
    }

    return(
        <GlobalContext.Provider value={funcs}>
            {children}
        </GlobalContext.Provider>
    )

}

export default GlobalContext; 