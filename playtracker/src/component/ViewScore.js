import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewScore = () => {
    const [score, setScore] = useState(0);

    useEffect(() => {
        // Fetch the score when the component mounts
        fetchScore();
    }, []);

    const fetchScore = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/score');
            setScore(response.data.score);
        } catch (error) {
            console.error('Error fetching score:', error);
        }
    };

    return (
        <div>
            <h2>View Score</h2>
            <p>Current Score: {score}</p>
        </div>
    );
};

export default ViewScore;
