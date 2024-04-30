import React, { useState } from 'react';
import './Squad_info.css';
import { useNavigate, useLocation } from 'react-router-dom';

const AddPlayersForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { team1, team2, mID } = location.state;
  const [team1Players, setTeam1Players] = useState(Array(11).fill({ name: '', role: '' }));
  const [team2Players, setTeam2Players] = useState(Array(11).fill({ name: '', role: '' }));

  const handlePlayerChange = (index, team) => (e) => {
    const { value } = e.target;
    if (team === 1) {
      const updatedPlayers = [...team1Players];
      updatedPlayers[index] = { ...updatedPlayers[index], name: value };
      setTeam1Players(updatedPlayers);
    } else if (team === 2) {
      const updatedPlayers = [...team2Players];
      updatedPlayers[index] = { ...updatedPlayers[index], name: value };
      setTeam2Players(updatedPlayers);
    }
  };

  const handleRoleChange = (index, team, role) => () => {
    if (team === 1) {
      const updatedPlayers = [...team1Players];
      updatedPlayers[index] = { ...updatedPlayers[index], role };
      setTeam1Players(updatedPlayers);
    } else if (team === 2) {
      const updatedPlayers = [...team2Players];
      updatedPlayers[index] = { ...updatedPlayers[index], role };
      setTeam2Players(updatedPlayers);
    }
  };

  const renderPlayerInputs = (team) => {
    const players = team === 1 ? team1Players : team2Players;
    return players.map((player, index) => (
      <div key={index} className="player-row">
        <input
          type="text"
          value={player.name}
          onChange={handlePlayerChange(index, team)}
          placeholder={`Player ${index + 1}`}
        />
        <div className="radio-buttons">
          <label>
            <input
              type="radio"
              name={`role-${team}-${index}`}
              value="Bat"
              checked={player.role === 'Bat'}
              onChange={handleRoleChange(index, team, 'Bat')}
            />
            Bat
          </label>
          <label>
            <input
              type="radio"
              name={`role-${team}-${index}`}
              value="Bowl"
              checked={player.role === 'Bowl'}
              onChange={handleRoleChange(index, team, 'Bowl')}
            />
            Bowl
          </label>
          <label>
            <input
              type="radio"
              name={`role-${team}-${index}`}
              value="All Round"
              checked={player.role === 'All Round'}
              onChange={handleRoleChange(index, team, 'All Round')}
            />
            All Round
          </label>
        </div>
      </div>
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any player name or role is empty
    const isEmpty = team1Players.concat(team2Players).some(player => !player.name || !player.role);

    if (isEmpty) {
      alert('Please fill in all fields');
      return;
    }

    // Prepare the data to be sent to the backend
    const data = {
      team1Players,
      team2Players,
      team1: team1 || 'Team 1',
      team2: team2 || 'Team 2',
      mID: mID,
    };

    try {
      // Send the data to the backend API route using an HTTP POST request
      const response = await fetch('http://localhost:8000/api/add_players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Data sent to backend successfully');
        // Optionally, you can reset the form data here
        setTeam1Players(Array(11).fill({ name: '', role: '' }));
        setTeam2Players(Array(11).fill({ name: '', role: '' }));
      } else {
        console.error('Failed to send data to backend');
      }
    } catch (error) {
      console.error('Error occurred while sending data to backend:', error);
    }

    navigate('/Score',{ state: { mID: mID } });
  };

  return (
    <div>
      <h2>Add Players</h2>
      <form onSubmit={handleSubmit} className="team-form">
        <div className="team-left">
          <h3>{team1 || 'Team 1'}</h3>
          {renderPlayerInputs(1)}
        </div>
        <div className="team-right">
          <h3>{team2 || 'Team 2'}</h3>
          {renderPlayerInputs(2)}
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddPlayersForm;
