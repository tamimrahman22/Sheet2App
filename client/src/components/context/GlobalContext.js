import { createContext, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../api'

const GlobalContext = createContext();
console.log('Creating store context...')

export function GlobalContextProvider({children}){
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    // GLOBAL STATE OF THE APPLICATION 
    const [appList, setAppList] = useState([]); 
    const [currentApp, setCurrentApp] = useState(null);
    const [appDataSources, setAppDataSources] = useState([]); 
    const [appViews, setAppViews] = useState([]);
    const [userRole, setUserRole] = useState("");
    // Functions to be used to manipulate the global state of our application 

    /* ---------- FUNCTION BELOW RELATE TO APPLICATIONS ---------- */

    // This function will load the lists of the current user.   
    const loadAppList = function() {
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
                // setCurrentApp(null);
                // setAppDataSources([]);
                // setAppViews([]);
            }
        }
        getLists();
    }

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
          try {
            // Send the request with the payload and wait for a response back. 
            const response = await api.createApp(payload);
            console.log('[STORE] Created application...', response)
            // After application has been created, reload the app list. 
            navigate('/dashboard', { replace: true })
          } catch (error) {
            console.error('[STORE] Error creating application', error);
            // handle the error here, e.g. show a snackbar or toast message
            const message = 'Error creating app: ' + error.response.data.message
            enqueueSnackbar(message, { variant: 'error' });
          }
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
            // if (auth.user.email === app.creator) {
            //     setUserRole("Developer");
            // }
            // else {
            //     for (let i = 0; i < app.roles.length; i++) {
            //         if (app.roles[i].users.includes(auth.user.email)) {
            //             setUserRole(app.roles[i].name);
            //             break;
            //         }
            //     }
            // }
        }
        // Check if the application already has data sources. If not, navigate to the editor page. 
        setCurrentApp(app);
        setAppDetails(app);
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
            const response = await api.setAppRoles(payload);
            console.log('[STORE] (Updating application roles...', response);
            currentApp.roles = response.data.roles;
        }
        setApplicationRoles(role, actions);
    }

    /* ---------- FUNCTIONS BELOW RELATE TO THE DATA SOURCES ---------- */
    
    // Add the spreadsheet as a data source to review 
    const addDataSource = function (appID, dataSourceName, sheetURL, sheetIndex, keys){
        async function addDataSource(appID, dataSourceName, sheetURL, sheetIndex, keys){
            let payload = {
                // Application ID of where we will be adding the data source to
                appId:appID, 
                // Name of the data source 
                dataSourceName: dataSourceName, 
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
        addDataSource(appID, dataSourceName, sheetURL, sheetIndex, keys); 
        // Verify we got the input we need!
        console.log('[STORE] Creating data source....')
        console.log('[STORE] Application ID: ', appID)
        console.log('[STORE] Data Source Name: ', dataSourceName)
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

    const updateInitialValue = function (dsID, colID, value){
        async function setInitialValue(dsID, colID, value){
            let payload = {
                appID: currentApp._id,
                dataSourceID: dsID,
                columnID: colID,
                value: value
            }
            console.log('[STORE] Sending request to update initial value of column....', payload)
            const response = await api.setInitialValue(payload);
            console.log('[STORE] Reloading data sources list for current application' )
            const res = await api.getDataSourcesByAppId(currentApp._id);
            setAppDataSources(res.data)
        }
        setInitialValue(dsID,colID,value);
    }

    const updateLabel = function(dsID, colID, value){
        async function setLabel(dsID, colID, value){
            let payload = {
                appID: currentApp._id,
                dataSourceID: dsID,
                columnID: colID,
                value: value
            }
            console.log('[STORE] Sending request to update the label of a column of a data source... ', payload)
            const response = await api.setLabel(payload);
            console.log('[STORE] Reloading data sources list for current application' )
            const res = await api.getDataSourcesByAppId(currentApp._id);
            setAppDataSources(res.data)
        }
        setLabel(dsID, colID, value);
    }

    const updateDataSourceReference = function(dsID, colID, dsRefValue){
        async function setDataSourceRef (dsID, colID, dsRefValue){
            let payload = {
                appID: currentApp._id,
                dataSourceID: dsID,
                columnID: colID,
                dataSourceRefValue: dsRefValue
            }
            console.log('[STORE] Sending request to update the data source reference of a column of a data source... ', payload)
            const response = await api.setDataSourceRef(payload);
            console.log('[STORE] Reloading data sources list for current application' )
            const res = await api.getDataSourcesByAppId(currentApp._id);
            setAppDataSources(res.data)
        }
        setDataSourceRef(dsID, colID, dsRefValue)
    }

    const updateColumnReference = function (dsID, colID, colRefValue){
        async function setColumnReference (dsID, colID, colRefValue){
            let payload = {
                appID: currentApp._id,
                dataSourceID: dsID,
                columnID: colID,
                columnRefValue: colRefValue
            }
            console.log('[STORE] Sending request to update the column reference of a column of a data source... ', payload)
            const response = await api.setColumnRef(payload);
            console.log('[STORE] Reloading data sources list for current application' )
            const res = await api.getDataSourcesByAppId(currentApp._id);
            setAppDataSources(res.data)
        }
        setColumnReference(dsID, colID, colRefValue);
    }

    /* ---------- FUNCTIONS BELOW RELATE TO THE VIEW ---------- */

    // Function to add a specified view type to the application
    const addView = function(tableId, viewType, columns, actions, roles) {
        async function createView(tableId, viewType, columns, actions, roles) {
            let payload = {
                // The id of the application we will be adding the view to
                appId: currentApp._id,
                // The id of the data source that was specified by the user
                tableId: tableId,
                // The view type that was specified by the user 
                viewType: viewType,
                // The selected columns
                columns: columns,
                // The selected actions
                actions: actions,
                // The selected roles
                roles: roles
            }
            console.log('[STORE] Sending request to create view... : ',payload)
            const response = await api.addView(payload);
            console.log('[STORE] Created view...', response);
            setApp(response.data);
            navigate("/editor/views");
        }
        createView(tableId, viewType, columns, actions, roles);
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
            console.log(`[STORE] Sending request to add record ${record} to ${tableId}`);
            const response = await api.addRecord(payload);
            if (response.status === 200) {
                console.log('[STORE] Reloading views for current application' );
                const res = await api.getViews(currentApp._id);
                setAppViews(res.data);
                // navigate("/editor/views")
            }
        }
        addRecordToView(record, tableId);
    }

    const deleteRecord = function(record, viewId, tableId) {
        async function deleteRecordFromSheet(record, viewId, tableId) {
            let payload = {
                record: record,
                viewId: viewId,
                tableId: tableId
            }
            console.log(`[STORE] Sending request to delete record ${record} from ${tableId}`);
            const response = await api.deleteRecord(payload);
            if (response.status === 200) {
                console.log('[STORE] Reloading views for current application' );
                const res = await api.getViews(currentApp._id);
                setAppViews(res.data);
                // navigate("/editor/views")
            }
        }
        deleteRecordFromSheet(record, viewId, tableId);
    }

    const editRecord = function(oldRecord, newRecord, tableId) {
        async function editRecordInSheet(oldRecord, newRecord, tableId) {
            let payload = {
                oldRecord: oldRecord,
                newRecord: newRecord,
                tableId: tableId,
            }
            console.log(`[STORE] Sending request to edit record ${oldRecord} from ${tableId}`);
            const response = await api.editRecord(payload);
            if (response.status === 200) {
                console.log('[STORE] Reloading views for current application' );
                // const res = await api.getViews(currentApp._id);
                // setAppViews(res.data);
            }
        }
        editRecordInSheet(oldRecord, newRecord, tableId);
    }

    const setViewRoles = function(viewId, roles) {
        async function setRolesForView(viewId, roles) {
            let payload = {
                viewId: viewId,
                roles: roles
            }
            console.log(`[STORE] Setting roles for view ${viewId}`);
            await api.setViewRoles(payload);
            console.log('[STORE] Reloading views for current application' );
            const res = await api.getViews(currentApp._id);
            setAppViews(res.data);
        }
        setRolesForView(viewId, roles);
    }

    const setViewColumns = function(viewId, viewType, columns) {
        async function setColumnsForView(viewId, viewType, columns) {
            let payload = {
                viewId: viewId,
                viewType: viewType,
                columns: columns
            }
            console.log(`[STORE] Setting columns for view ${viewId}`);
            await api.setViewColumns(payload);
            const res = await api.getViews(currentApp._id);
            setAppViews(res.data);
        }
        setColumnsForView(viewId, viewType, columns);
    }

    const setViewActions = function(viewId, actions) {
        async function setAllowedActionsForView(viewId, actions) {
            let payload = {
                viewId: viewId,
                actions: actions
            }
            console.log(`[STORE] Setting actions for view ${viewId}`);
            await api.setViewAllowedActions(payload);
            console.log('[STORE] Reloading views for current application' );
            const res = await api.getViews(currentApp._id);
            setAppViews(res.data);
        }
        setAllowedActionsForView(viewId, actions);
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
        userRole,
        setUserRole,

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
        updateInitialValue,
        updateLabel,
        updateDataSourceReference,
        updateColumnReference,
        
        // VIEWS
        addView,
        renameView,
        deleteView,
        addRecord,
        deleteRecord,
        editRecord,
        setViewRoles,
        setViewColumns,
        setViewActions,
    }

    return(
        <GlobalContext.Provider value={funcs}>
            {children}
        </GlobalContext.Provider>
    )

}

export default GlobalContext; 