import React from 'react';

const SchedulePage = () => {
    const matches = [
        { id: 1, homeTeam: 'Team A', awayTeam: 'Team B', date: '2024-05-01', time: '15:00' },
        { id: 2, homeTeam: 'Team C', awayTeam: 'Team D', date: '2024-05-02', time: '18:00' },
        { id: 3, homeTeam: 'Team E', awayTeam: 'Team F', date: '2024-05-03', time: '14:30' },
    ];

    return (
        <div className="schedule-page">
            <h1>Upcoming Matches</h1>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Home Team</th>
                        <th>Away Team</th>
                    </tr>
                </thead>
                <tbody>
                    {matches.map(match => (
                        <tr key={match.id}>
                            <td>{match.date}</td>
                            <td>{match.time}</td>
                            <td>{match.homeTeam}</td>
                            <td>{match.awayTeam}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SchedulePage;
