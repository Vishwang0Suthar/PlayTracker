import React, { useState } from 'react';
import axios from 'axios';

const UpdateScore = () => {
  const [newScore, setNewScore] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/score', { score: newScore });
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error updating score:', error);
      setMessage('An error occurred while updating score');
    }
  };

  return (
    <div>
      <h2>Update Score</h2>
      <form onSubmit={handleUpdateScore}>
        <label htmlFor="newScore">New Score:</label>
        <input
          type="number"
          id="newScore"
          value={newScore}
          onChange={(e) => setNewScore(e.target.value)}
        />
        <button type="submit">Update Score</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateScore;
