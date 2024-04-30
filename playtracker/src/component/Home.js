// Home.js
import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import axios from 'axios';
import './Card.css';

const Home = () => {
  const [matches, setMatches] = useState([]);
  const matchesContainerRef = useRef(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/get_match_info');
        setMatches(response.data);
        console.log(response.data); // Logging the fetched data
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };
    fetchMatches();
  }, []);

  const handleScrollLeft = () => {
    matchesContainerRef.current.scrollLeft -= 400;
  };

  const handleScrollRight = () => {
    matchesContainerRef.current.scrollLeft += 400;
  };

  return (
    <div className="card-container">
      <h1 className="h1">Matches For You</h1>
      <div className="matches-container" ref={matchesContainerRef}>
        {matches.length > 0 ? (
          matches.map(match => <Card key={match.mID} match={match} />)
        ) : (
          <p>No matches found</p>
        )}
      </div>
      <div className="button-container">
        <button className="scroll-button left" onClick={handleScrollLeft}>
          &lt;
        </button>
        <button className="scroll-button right" onClick={handleScrollRight}>
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Home;
