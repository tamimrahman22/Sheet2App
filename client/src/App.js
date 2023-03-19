import './App.css';
import { useEffect, useState } from 'react';
import jwt_decode from "jwt-decode";

function App() {
  const [ user, setUser ] = useState({});

  function handleInitalizeCallback(response) {
    console.log("TOKEN: " + response.credential);
    var user = jwt_decode(response.credential);
    console.log(user);
    setUser(user);
    document.getElementById("signInDiv").hidden = true;
  }

  function handleSignOut() {
    setUser({});
    document.getElementById("signInDiv").hidden = false;
  }
  
  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: "382110346041-m240qc561dnte39gobhn1f0int19uusr.apps.googleusercontent.com",
      callback: handleInitalizeCallback
    });

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large"}
    );
  })
  return (
    <div className="App">
      <div id="signInDiv"></div>
      { user &&
        <div>
          <img src={user.picture} alt=""></img>
          <h3>{user.email}</h3>
          <button onClick={ (e) => handleSignOut(e)}>Sign Out</button>
        </div>
      }
    </div>
  );
}

export default App;
