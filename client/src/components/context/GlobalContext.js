import { createContext, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import api from '../../api'

const GlobalContext = createContext();
console.log('Creating store context...')

export function GlobalContextProvider({children}){
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    // GLOBAL STATE OF THE APPLICATION 
    const [appList, setAppList] = useState([]); 
    const [currentApp, setCurrentApp] = useState(null);
    const [appDataSource, setAppDataSource] = useState([]); 
    const [appViews, setAppViews] = useState([]);

    // Functions to be used to manipulate the global state of our application 

    // This function will load the lists of the current user.   
    const loadAppList = function(){
        async function getLists() {    
            let payload = {
                user: auth.user.email,
            }
            const response = await api.getAppList(payload);
            console.log('[STORE] Response: ', response);
            console.log('[STORE] Data: ',  response.data);
            // Set the app list with the new lists that were found! 
            setAppList(response.data);
            setCurrentApp(null);
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
    
    // This function will be used in order to set the current app for S2A and also getting the required information regarding existing data sources for the user. 
    const setApp = function(app){
        async function setAppDetails(app){
            console.log('[STORE] GETTING DATA SOURCES FOR THE APPLICATION!')
            const ds = app.dataSources 
            console.log('[STORE] DATA SOURCES FOR THE APPLICATION IS: ', ds)
            const response = await api.getDataSourcesByAppId(app._id);
            console.log(response.data)
            setAppDataSource(response.data)
            const viewResponse = await api.getViews(app._id);
            console.log('[STORE] Getting application views...', viewResponse);
            setAppViews(viewResponse.data);
            navigate("/editor");
        }
        // Check if the application already has data sources. If not, navigate to the editor page. 
        setCurrentApp(app)
        setAppDetails(app)
    }
    
    // Add the spreadsheet as a data source to review 
    const createDataSource = function (appID, sheetURL, sheetIndex, keys){
        async function createDataSource(){
            let payload = {
                appId:appID, 
                url:sheetURL, 
                sheetIndex:sheetIndex-1, 
                keys:keys 
            };
            console.log('[STORE] Sending request to create data source... : ',payload)
            const response = await api.createDataSource(payload)
            console.log('[STORE] Created data source...', response)
            // Set the current app list to be the one that was update with the data source!
            setCurrentApp(response.data)
            async function getLists() {    
                let payload = {
                    user: auth.user.email,
                }
                const response = await api.getAppList(payload);
                console.log('[STORE] Response: ', response);
                console.log('[STORE] Data: ',  response.data);
                // Set the app list with the new lists that were found! 
                setAppList(response.data);
            }
            // Update our AppList with the latest information!
            getLists();
        }
        createDataSource(appID, sheetURL, sheetIndex, keys); 
        // Verify we got the input we need!
        console.log('[STORE] Creating data source....')
        console.log('[STORE] Application ID: ', appID)
        console.log('[STORE] Spreadsheet: ', sheetURL)
        console.log('[STORE] Sheet Index: ', sheetIndex-1)
        console.log('[STORE] Keys: ', keys)
    }

    // Function to rename the application! 
    const renameApp = function(name) {
        async function renameApplication(name) {
            let payload = {
                appId: currentApp._id,
                newName: name,
            }
            const response = await api.renameApp(payload);
            console.log('[STORE] Renaming application...', response);
            if (response.status === 200) {
                setCurrentApp(response.data);
            }
        }
        renameApplication(name);
    }

    // Function to publish the application! 
    const publishApp = function() {
        async function publishApplication() {
            let payload = {
                appId: currentApp._id
            }
            const response = await api.publishApp(payload);
            console.log('[STORE] (Un)publishing application...', response);
            if (response.status === 200) {
                setCurrentApp(response.data);
            }
        }
        publishApplication()
    }

    // IF THIS GETS BIG WE MIGHT NEED A REDUCER
    const funcs = {
        appList, 
        setAppList, 
        currentApp, 
        setCurrentApp,
        appDataSource,
        setAppDataSource,
        appViews,
        setAppViews,
        loadAppList, 
        createApp,
        renameApp,
        publishApp,
        createDataSource,
        setApp,
    }

    return(
        <GlobalContext.Provider value={funcs}>
            {children}
        </GlobalContext.Provider>
    )

}

export default GlobalContext; 