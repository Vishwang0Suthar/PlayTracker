import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Card.css';

const Card = ({ match }) => {
  const navigate = useNavigate();

  //Function
  const handleCardClick = (matchID) => {
    if (matchID) {
      navigate('/matches/squad', { state: { mID: matchID } });
    } else {
      console.error('Match ID is undefined');
    }
  };

  // Format the date using toLocaleDateString()
  const formattedDate = new Date(match.mDate).toLocaleDateString();

  return (
    <div className="match-card" onClick={() => handleCardClick(match.mID)}>
      <div className="match-details">
        <div className="time">{formattedDate} {match.mTime}</div>
        <div className="venue">{match.venue}</div>
      </div>
      <div className="team-details">
        <div className="team">{match.Team1}</div>
        <div className="vs">vs</div>
        <div className="team">{match.Team2}</div>
      </div>
      <div className="description">{match.Description}</div>
    </div>
  );
};

export default Card;