import './App.css';
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import Header from './components/Header';
import Navbar from './components/Navbar';
import AccountSelector from './components/AccountSelector';
import ProfileCard from './components/ProfileCard';

// main components
import NewPost from './components/NewPost';
import ProfileInsights from './components/ProfileInsights';
import SquealsInsights from './components/SquealsInsights.js';
import Messages from './components/Messages';
import Shop from './components/Shop';

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
//globalState.$user = globalState.$user.user || null
globalState.$user = "SMMTest";
console.log("current user: " + globalState.$user);


function App() {
  const [smm_account, setSmmAccount] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

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


  const handleSelectedAccountChange = (newAccount) => {
    console.log('Selected account has changed:', newAccount);
    setSelectedAccount(newAccount);
  };

  return (
    <div className="App">

      <Header />

      <div className="container-fluid">
        <Router>
        <div className="row">
          <nav className="col-md-2 d-none d-md-block bg-light sidebar">
            {<AccountSelector onAccountChange={handleSelectedAccountChange}/>}
            <Navbar />
            {smm_account ? <ProfileCard profile={smm_account} /> : <p>Loading...</p>}
          </nav>

          <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
            <Routes>
              <Route path="/new" element={<NewPost selectedAccount={selectedAccount}/>} />
              <Route path="/profile" element={<ProfileInsights selectedAccount={selectedAccount}/>} />
              <Route path="/squeals" element={<SquealsInsights selectedAccount={selectedAccount}/>} />
              <Route path="/messages" element={<Messages selectedAccount={selectedAccount}/>} />
              <Route path="/shop" element={<Shop selectedAccount={selectedAccount}/>} />
            </Routes>
          </main>
        </div>
        </Router>
      </div>
    </div>
  );
}

export default App;
