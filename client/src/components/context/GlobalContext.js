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
    const [appDataSources, setAppDataSources] = useState([]); 
    const [appViews, setAppViews] = useState([]);

    // Functions to be used to manipulate the global state of our application 

    /* ---------- FUNCTION BELOW RELATE TO APPLICATIONS ---------- */

    // This function will load the lists of the current user.   
    const loadAppList = function(){
        async function getLists() {    
            let payload = {
                // Get all the list of applications by the name of the user 
                user: auth.user.email,
            }
            const response = await api.getAppList(payload);
            console.log('[STORE] Response: ', response);
            console.log('[STORE] Data: ',  response.data);
            // Set the app list with the new lists that were found! 
            if (response.status === 200) {
                setAppList(response.data);
                setCurrentApp(null);
                setAppDataSources([]);
                setAppViews([]);
            }
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
            setAppDataSources(response.data)
            const viewResponse = await api.getViews(app._id);
            console.log('[STORE] Getting application views...', viewResponse);
            setAppViews(viewResponse.data);
            // navigate("/editor");
        }
        // Check if the application already has data sources. If not, navigate to the editor page. 
        setCurrentApp(app)
        setAppDetails(app)
    }

    // Function to rename the application! 
    const renameApp = function(name) {
        async function renameApplication(name) {
            let payload = {
                // The id of the application's name we will be editing
                appId: currentApp._id,
                // The name that was given from the user
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

    const deleteApp = function() {
        async function deleteApplication() {
            let payload = {
                appId: currentApp._id
            }
            const response = await api.deleteApp(payload);
            console.log('[STORE] (Deleting application...', response);
            if (response.status === 200) {
                navigate("/dashboard");
            }
        }
        deleteApplication();
    }

    const setAppRoles = function(role, actions) {
        async function setApplicationRoles(role, actions) {
            let payload = {
                appId: currentApp._id,
                role: role,
                actions: actions,
            }
            const response = await api.setRoles(payload);
            console.log('[STORE] (Updating application roles...', response);
            currentApp.roles = response.data.roles;
        }
        setApplicationRoles(role, actions);
    }

    /* ---------- FUNCTIONS BELOW RELATE TO THE DATA SOURCES ---------- */
    
    // Add the spreadsheet as a data source to review 
    const addDataSource = function (appID, sheetURL, sheetIndex, keys){
        async function addDataSource(){
            let payload = {
                // Application ID of where we will be adding the data source to
                appId:appID, 
                // The URL to the Google SpreadSheet 
                url:sheetURL, 
                // Sheet index of where the data source is being generated from 
                sheetIndex:sheetIndex-1,
                // The key column 
                keys:keys 
            };
            console.log('[STORE] Sending request to create data source... : ',payload)
            const response = await api.addDataSource(payload)
            console.log('[STORE] Created data source...', response)
            // Set the current app list to be the one that was update with the data source!
            setApp(response.data);
            navigate("/editor/data");
            
            // Update the list of application with the latest information
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
            getLists();
        }
        addDataSource(appID, sheetURL, sheetIndex, keys); 
        // Verify we got the input we need!
        console.log('[STORE] Creating data source....')
        console.log('[STORE] Application ID: ', appID)
        console.log('[STORE] Spreadsheet: ', sheetURL)
        console.log('[STORE] Sheet Index: ', sheetIndex-1)
        console.log('[STORE] Keys: ', keys)
    }

    //Function for re-naming the data source of an application 
    const renameDataSource = function(newName, dataSource){
        async function changeName(dataSourceName){
            //Define they payload we need to send to the backend
            let payload = {
                //ID of the current application
                appID: currentApp._id,
                //Name of the datasource
                name: dataSourceName,
                // ID of the data source
                dataSourceID: dataSource._id
            }
            // Send a request to the backend 
            console.log('[STORE] Sending payload to rename the data source...', payload)
            await api.renameDataSource(payload);
            console.log('[STORE] Reloading data sources list for current application' )
            const res = await api.getDataSourcesByAppId(currentApp._id);
            setAppDataSources(res.data)
        }
        console.log('[STORE] Changing name of data source to: ', newName)
        console.log('[STORE] Data Source is: ', dataSource)
        changeName(newName, dataSource)
    }

     // Function to specify the key column of a data source! 
     const setKeys = function (keyColumnName, dataSource){
        async function setKeyColumn (){
            let payload = {
                //ID of the current application
                appID: currentApp._id,
                //Name of the datasource
                keyName: keyColumnName,
                // ID of the data source
                dataSourceID: dataSource._id
            }
            // Send a request to the backend 
            console.log('[STORE] Sending payload to set the key column...', payload)
            await api.setKeys(payload)
            console.log('[STORE] Reloading data sources list for current application' )
            const res = await api.getDataSourcesByAppId(currentApp._id);
            setAppDataSources(res.data)
        }
        setKeyColumn(keyColumnName, dataSource)
    }

    const deleteDataSource = function(dataSourceID) {
        async function deleteDataSourceById(dataSourceID) {
            let payload = {
                appId: currentApp._id,
                dataSourceID: dataSourceID
            }
            console.log('[STORE] Sending request to delete data source... : ',payload);
            const response = await api.deleteDataSource(payload);
            if (response.status === 200) {
                console.log('[STORE] Reloading data sources list for current application' )
                const resp = await api.getDataSourcesByAppId(currentApp._id);
                setAppDataSources(resp.data)

                console.log('[STORE] Reloading views for current application' );
                const res = await api.getViews(currentApp._id);
                setAppViews(res.data);
            }
        }
        deleteDataSourceById(dataSourceID);
    }

    /* ---------- FUNCTIONS BELOW RELATE TO THE VIEW ---------- */

    // Function to add a specified view type to the application
    const addView = function(tableId, viewType) {
        async function createView(tableId, viewType) {
            let payload = {
                // The id of the application we will be adding the view to
                appId: currentApp._id,
                // The id of the data source that was specified by the user
                tableId: tableId,
                // The view type that was specified by the user 
                viewType: viewType
            }
            console.log('[STORE] Sending request to create view... : ',payload)
            const response = await api.addView(payload);
            console.log('[STORE] Created view...', response);
            setApp(response.data);
            navigate("/editor/views")
        }
        createView(tableId, viewType);
    }

    const renameView = function(name, viewId) {
        async function changeViewName(name, viewId) {
            let payload = {
                name: name,
                viewId: viewId
            }
            console.log('[STORE] Sending request to rename view... : ',payload);
            await api.renameView(payload);
            console.log('[STORE] Reloading views for current application' );
            const res = await api.getViews(currentApp._id);
            setAppViews(res.data);
        }
        console.log('[STORE] Changing name of view to: ', name);
        console.log('[STORE] View is: ', viewId);
        changeViewName(name, viewId);
    }

    const deleteView = function(viewId) {
        async function deleteViewbyId(viewId) {
            let payload = {
                appId: currentApp._id,
                viewId: viewId
            }
            console.log('[STORE] Sending request to delete view... : ',payload);
            const response = await api.deleteView(payload);
            if (response.status === 200) {
                console.log('[STORE] Reloading views for current application' );
                const res = await api.getViews(currentApp._id);
                setAppViews(res.data);
            }
        }
        deleteViewbyId(viewId);
    }

    const addRecord = function(record, tableId) {
        async function addRecordToView(record, tableId) {
            let payload = {
                record: record,
                tableId: tableId
            }
            const response = await api.addRecord(payload);
            if (response.status === 200) {
                const res = await api.getViews(currentApp._id);
                setAppViews(res.data);
            }
        }
        addRecordToView(record, tableId);
    }

    // IF THIS GETS BIG WE MIGHT NEED A REDUCER
    const funcs = {
        // STATES
        appList, 
        setAppList, 
        currentApp, 
        setCurrentApp,
        appDataSources,
        setAppDataSources,
        appViews,
        setAppViews,

        // APPS
        loadAppList, 
        createApp,
        setApp,
        renameApp,
        publishApp,
        deleteApp,
        setAppRoles,

        // DATA SOURCES
        addDataSource,
        renameDataSource,
        setKeys,
        deleteDataSource,
        
        // VIEWS
        addView,
        renameView,
        deleteView,
        addRecord,
    }

    return(
        <GlobalContext.Provider value={funcs}>
            {children}
        </GlobalContext.Provider>
    )

}

export default GlobalContext; 