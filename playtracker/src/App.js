import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './component/Navbar';
import Login from './component/Login';
import Signup from './component/Signup';
import Matches from './component/Matches';
import Rankings from './component/Rankings';
import Schedule from './component/Schedule';
import Teams from './component/Teams';
import Home from './component/Home';
import Squad from './component/Squad';
import Squad_info from './component/Admin/Squad_info';
import Match from './component/Admin/Match_info'
import Admin from './component/Admin/Admin';
import Match_info from './component/Admin/Match_info'
import Score_update from './component/Admin/Score'
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    // <Score_update />
    // <Score/>
    // <Home />
    // <Squad_info />
    // <Match />
    // <Match_info/>
      <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
        <Route path="/matches/*" element={<Matches />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/schedule" element={<Schedule />} />
        {/* <Route path="/teams" element={<Teams />} /> */}
        <Route path="/squad" element={<Squad />} />
        <Route path='/admin' element={<Match/>}/>
        <Route path="/*" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;