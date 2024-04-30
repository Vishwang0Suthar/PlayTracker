import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Score_navbar from './Score_Navbar';
import LiveMatchInfo from './LiveMatchInfo';
import ScoreboardTable from './ScoreBoardTable';
import Squad from './Squad';

const Matches = () => {
  return (
    <div>
      <Score_navbar />
      <Routes>
        <Route path="/livematchinfo" element={<LiveMatchInfo />} />
        <Route path="/scoreboardtable" element={<ScoreboardTable />} />
        <Route path="/squad" element={< Squad />} />
      </Routes>
    </div>
  );
};

export default Matches;