import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Match_info from './Match_info';
import Squad_info from './Squad_info';
import Score from './Score';
const Admin = () => {
  return (
    <div>
      <Routes>
        <Route path="/Match_info" element={<Match_info />} />
        <Route path="/Squad_info" element={<Squad_info />} />
        <Route path="/Score" element={<Score />} />
      </Routes>
    </div>
  );
};

export default Admin;