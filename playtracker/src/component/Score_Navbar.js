import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './Score-navbar.css';

export const Navbar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/matches/livematchinfo">Live Match Info</Link>
        </li>
        <li>
          <Link to="/matches/scoreboardtable">Scoreboard</Link>
        </li>
        <li>
          <Link to="/matches/squad">Squad</Link>
        </li>
      </ul>
    </nav>
  );
};

const LiveMatchInfo = () => {
  return (
    <div>
      <h1>Live Match Info</h1>
      {/* Add content specific to Live Match Info */}
    </div>
  );
};

const Scoreboard = () => {
  return (
    <div>
      <h1>Scoreboard</h1>
      {/* Add content specific to Scoreboard */}
    </div>
  );
};

const Squad = () => {
  return (
    <div>
      <h1>Squad</h1>
      {/* Add content specific to Squad */}
    </div>
  );
};


export default Navbar;