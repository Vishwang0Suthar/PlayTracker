import React from 'react';
import './Ranking.css'
const TeamRankingPage = () => {
    const teams = [
        { id: 1, name: 'Team A', points: 120 },
        { id: 2, name: 'Team B', points: 100 },
        { id: 3, name: 'Team C', points: 90 },
        { id: 4, name: 'Team D', points: 80 },
        { id: 5, name: 'Team E', points: 70 },
    ];

    return (
        <div className="team-ranking-page">
            <h1>Team Rankings</h1>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Team Name</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {teams.map((team, index) => (
                        <tr key={team.id}>
                            <td>{index + 1}</td>
                            <td>{team.name}</td>
                            <td>{team.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TeamRankingPage;