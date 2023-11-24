import './App.css';
import Header from './components/Header';
import Navbar from './components/Navbar';

import '../../node_modules/bootstrap/dist/css/bootstrap.css'
import '../../node_modules/bootstrap/dist/js/bootstrap.bundle.js'

function App() {
  return (
<div className="App">

  <Header />

  <div className="container-fluid">
    <div className="row">
      <nav className="col-md-2 d-none d-md-block bg-light sidebar">
        <Navbar />
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
