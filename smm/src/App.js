import './App.css';
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import AccountSelector from './components/AccountSelector';
import ProfileCard from './components/ProfileCard.js';

import '../../node_modules/bootstrap/dist/css/bootstrap.css'
import '../../node_modules/bootstrap/dist/js/bootstrap.bundle.js'

import axios from 'axios';

export const globalState = {
  $user: null,
  $selectedAccount: null
};

// globally defining the smm user
globalState.$user = await fetch("https://site222326.tw.cs.unibo.it/user-check", { method: "GET" });
globalState.$user = await globalState.$user.json();
globalState.$user = globalState.$user.user || null
//globalState.$user = "SMMTest";
console.log("current user: " + globalState.$user);


function App() {
  const [smm_account, setSmmAccount] = useState(null);

  useEffect(() => {
    if (globalState.$user == null) {
      window.location.href = "https://site222326.tw.cs.unibo.it/login";
    } else {
      axios.get(`https://site222326.tw.cs.unibo.it/profiles/${globalState.$user}`)
        .then(res => {
          const account = res.data;
          setSmmAccount(account);

          if (account.account_type !== "smm") {
            switch (account.account_type) {
              case "user":
              case "premium":
                window.location.href = "https://site222326.tw.cs.unibo.it/app";
                break;
              case "admin":
                window.location.href = "https://site222326.tw.cs.unibo.it/admin";
                break;
              default:
                window.location.href = "https://site222326.tw.cs.unibo.it/login";
                break;
            }
          }
        })
    }
  }, []);

  return (
    <div className="App">

      <Header />

      <div className="container-fluid">
        <div className="row">
          <nav className="col-md-2 d-none d-md-block bg-light sidebar">
            {<AccountSelector />}
            <Navbar />
            {smm_account ? <ProfileCard profile={smm_account}/> : <p>Loading...</p>}
          </nav>

          <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
            <p>main content</p>
            { /* TEMP */}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
