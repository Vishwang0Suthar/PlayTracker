import React, { useState, useEffect } from 'react';
import './Squad.css';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Squad = () => {
    const [squad, setSquad] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const { mID } = location.state;

    useEffect(() => {
        const fetchSquad = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/get_squad/${mID}`);
                setSquad(response.data);
                setIsLoading(false);
            } catch (error) {
                setError(error.message);
                setIsLoading(false);
            }
        };

        fetchSquad();
    }, [mID, location]);

    if (isLoading) {
        return <div className="text-center my-5">Loading...</div>;
    }

    if (error) {
        return <div className="text-center my-5">Error: {error}</div>;
    }

    return (
        <div className="squad-container">
            <h1 className="text-center my-5">Squad</h1>
            <div className="team-container">
                {squad.map((team, index) => (
                    <div key={index} className="team-section">
                        <h2 className="team-name">{team.playerTeam} Squad</h2>
                        <ul className="player-list">
                            {team.players.map((player, playerIndex) => (
                                <li key={playerIndex} className="player-item">
                                    {player.playerName} ({player.playerType})
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Squad;
