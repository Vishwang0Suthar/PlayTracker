import React, { useState, useEffect } from 'react';

const LiveCommentary = () => {
  const [commentary, setCommentary] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Simulating live commentary updates
    const commentaryInterval = setInterval(() => {
      const randomComment = `Over ${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 6)}: ${getRandomCommentary()}`;
      setCommentary((prevCommentary) => [...prevCommentary, randomComment]);
    }, 5000); // Update every 5 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(commentaryInterval);
  }, []);

  const handleNewCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setCommentary((prevCommentary) => [...prevCommentary, newComment]);
      setNewComment('');
    }
  };

  const getRandomCommentary = () => {
    const comments = [
      'That\'s a brilliant shot!',
      'Excellent fielding!',
      'What a delivery!',
      'The batsman played it well.',
      'That was a poor shot selection.',
      'The bowler is on fire today!',
      'The batsman is looking solid.',
      'The crowd is going wild!',
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  };

  return (
    <div>
      <h2>Live Commentary</h2>
      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {commentary.map((comment, index) => (
          <p key={index}>{comment}</p>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={newComment}
          onChange={handleNewCommentChange}
          placeholder="Add your comment"
        />
        <button onClick={handleAddComment}>Add Comment</button>
      </div>
    </div>
  );
};

export default LiveCommentary;