import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import Header from './components/Header';
import Navbar from './components/Navbar';
import AccountSelector from './components/AccountSelector';
// import ProfileCard from './components/ProfileCard';
import MiniProfileCard from './components/MiniProfileCard';
import SquealInsight from './components/SquealInsight.js';


// main components
import { SquealPutHoc } from './components/SquealPutHoc.js';
import ProfileInsights from './components/ProfileInsights';
import SquealsInsights from './components/SquealsInsights.js';
import Messages from './components/Messages';
import Shop from './components/Shop';

import '../../node_modules/bootstrap/dist/css/bootstrap.css'
import '../../node_modules/bootstrap/dist/js/bootstrap.bundle.js'

import axios from 'axios';
import MessagesSearchBar from './components/MessageSearchBar.js';

export const globalState = {
  $user: null,
  $selectedAccount: null
};

// globally defining the smm user
globalState.$user = await fetch("https://site222326.tw.cs.unibo.it/user-check", { method: "GET" });
globalState.$user = await globalState.$user.json();
globalState.$user = globalState.$user.user || null
//globalState.$user = "SMMTest"; //! DEBUG, REMOVE BEFORE RELEASE
console.log("current user: " + globalState.$user);


function App() {
  const [smm_account, setSmmAccount] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [is_looping, setLooping] = useState(false);
  const [timeout_id, setTimeout_id] = useState(null);

  useEffect(() => {
    if (globalState.$user == null) {
      window.location.href = "https://site222326.tw.cs.unibo.it/login";
    } else {
      axios.get(`https://site222326.tw.cs.unibo.it/profiles/${globalState.$user}`)
        .then(res => {
          const account = res.data;
          setSmmAccount(account);
          setSelectedAccount(account);

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

  const stopLoop = () => {
    console.log("stopping loop")
    setLooping(false);
    clearTimeout(timeout_id);
  }

  const isLoopingRef = useRef(is_looping);

  useEffect(() => {
    isLoopingRef.current = is_looping;
  }, [is_looping]);


  const waitForLooping = () => {
    return new Promise(resolve => {
      const checkLooping = () => {
        if (isLoopingRef.current) {
          resolve();
        } else {
          setTimeout(checkLooping, 100); // check every 100ms
        }
      };
      checkLooping();
    });
  };

  const loopPost = async (formData, delay, times) => {
    if (is_looping) {
      stopLoop();
      // wait until the loop is stopped
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setLooping(true);

    await waitForLooping();

    // time = negative -> infinite loop (sorta)
    if (times < 0) {
      times = 99999;
    }

    if (delay <= 0) {
      delay = 1;
    }

    // turn delay in mins
    delay = delay * 1000 * 60;

    let jsonBody = JSON.parse(formData.get('json'));

    jsonBody.text = "automatic post " + 0 + " " + jsonBody.text

    for (let i = 0; i < times; i++) {
      console.log("looping post " + (i + 1) + " of " + times);
      try {

        // send an alert with sound to the user
        alert("automatic post " + (i + 1) + " sent!");
        // play sound
        let audio = new Audio("https://site222326.tw.cs.unibo.it/sounds/notification-sound.mp3");
        audio.play();

        // update text
        jsonBody.text = jsonBody.text.replace(/automatic post \d+ /, "automatic post " + (i + 1) + " ");

        formData.set("json", JSON.stringify(jsonBody));

        console.log("sending body: ", formData);
        // Send formData to server using axios or fetch
        const response = await axios.put(
          "https://site222326.tw.cs.unibo.it/squeals/",
          formData
        );

        console.log(response.data);
        if (response.status == 200) {
          let id = response.data.squeal_id;
          // change page into published squeal
          this.props.navigate(`smm/squeals/${id}`);
        } else {
          break;
        }

        // wait for delay
        await new Promise(
          (resolve) => (setTimeout_id(setTimeout(resolve, delay)))
        );
        if (!isLoopingRef.current) {
          break;
        }
      } catch (error) {
        console.log(error);
        break;
      }
    }

    // set looping to false
    setLooping(false);
  }

  const loopObject = {
    stopLoop: stopLoop,
    is_looping: is_looping,
    setLooping: setLooping,
    setTimeout_id: setTimeout_id,
    loopPost: loopPost
  }

  const handleSelectedAccountChange = (newAccount) => {
    console.log('Selected account has changed:', newAccount);
    setSelectedAccount(newAccount);
  };

  return (
    <div className="App">

      <Header selectedAccount={selectedAccount} loopObject={loopObject} />

      <div className="container-fluid">
        <Router>
          <div className="row">
            <button className="d-md-none btn btn-primary" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            </button>
            <nav className={`col-md-2 bg-light sidebar ${isSidebarOpen ? 'd-block' : 'd-none'}`}>
              <AccountSelector onAccountChange={handleSelectedAccountChange} selectedAccount={selectedAccount} />
              <Navbar />
              {smm_account ?
                <MiniProfileCard profile={smm_account} />
                : <p>Loading...</p>}
            </nav>

            <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
              <Routes>
                <Route path="smm" element={<h1>Click any tab to get started!</h1>} />
                <Route path="smm/squealPut" element={<SquealPutHoc selectedAccount={selectedAccount} onAccountChange={handleSelectedAccountChange} loopObject={loopObject} />} />
                <Route path="smm/profile" element={<ProfileInsights selectedAccount={selectedAccount} />} />
                <Route path="smm/squeals" element={<SquealsInsights selectedAccount={selectedAccount} />} />
                <Route path="smm/messages" element={<MessagesSearchBar />} />
                <Route path="smm/shop" element={<Shop selectedAccount={selectedAccount} />} />

                <Route path="smm/messages/:id" element={<Messages selectedAccount={selectedAccount} />} />
                <Route path="smm/squeals/:id" element={<SquealInsight selectedAccount={selectedAccount} />} />
                <Route path="smm/profile/:id" element={<h1>Soon pt 2</h1>} />

              </Routes>
            </main>
          </div>
        </Router>
      </div>
    </div>
  );
}

export default App;
