import { createContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
console.log('Creating auth context...')

export function AuthContextProvider({children}) {
    const navigate = useNavigate();

    // STATE VARIABLES WE WILL BE PROVIDING TO THE REST OF THE APP REGARDING AUTH
    const[user, setUser] = useState(null)


    // FUNCTION TO LOGOUT THE USER! 
    const logout = function(){
        setUser(null)
        // NAVIGATE BACK TO THE LOGIN PAGE! 
        navigate('/', { replace: true })
    }


    // CHECK WHO THE CURRENT USER IS  
    useEffect(()=>{
        console.log('[AUTH CONTEXT] USER is: ', user)
        // NAVIGATE THEM TO THE DASHBOARD IF WE HAVE A USER LOGGED IN!
        if (user)
            navigate('/dashboard', { replace: true });
        else
            // NAVIGATE THEM TO THE LOGIN PAGE IF THEY ARE NOT LOGGED IN!
            navigate('/', { replace: true })
    }, [user])

    return(
        <AuthContext.Provider value={{user, setUser, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext