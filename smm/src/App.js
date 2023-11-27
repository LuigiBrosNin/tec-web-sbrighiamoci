import './App.css';
import Header from './components/Header';
import Navbar from './components/Navbar';
import AccountSelector from './components/AccountSelector';

import '../../node_modules/bootstrap/dist/css/bootstrap.css'
import '../../node_modules/bootstrap/dist/js/bootstrap.bundle.js'

import axios from 'axios';
import ProfileCard from './components/ProfileCard.js';

// globally defining the smm user
let $user = await fetch("https://site222326.tw.cs.unibo.it/user-check", { method: "GET"});
$user = await $user.json();
$user = $user.user || null
//$user = "smm1";
console.log("current user: " + $user);
export { $user };

// globally defining the selected account
let $selectedAccount = null;
export { $selectedAccount };

function App() {
  let smm_account = null;
  // user check
  if ($user == null) {
    window.location.href = "https://site222326.tw.cs.unibo.it/login";
  } else { // get smm account
    axios.get(`https://site222326.tw.cs.unibo.it/profiles/${$user}`)
      .then(res => {
        smm_account = res.data;

        // if the user is not an smm account, redirect to the correct page
        if (smm_account.account_type !== "smm") {
          switch (smm_account.account_type) {
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

  return (
<div className="App">

  <Header />

  <div className="container-fluid">
    <div className="row">
      <nav className="col-md-2 d-none d-md-block bg-light sidebar">
        <AccountSelector />
        <Navbar />
        <ProfileCard profile={smm_account}/>
      </nav>

      <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
        <p>main content</p>
         { /* TEMP */ }
      </main>
    </div>
  </div>
</div>
  );
}

export default App;
