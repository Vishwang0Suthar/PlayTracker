// server.js

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const updateScoreRouter = require('./updateScore1');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const app = express();
const port = 8000;

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test',
});

// Connect to MySQL
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Enable CORS for all routes
app.use(cors());

// Middleware for parsing request body
app.use(express.json());

// Mount the updateScoreRouter to the '/api' path
app.use('/api', updateScoreRouter);

function generateSecretKey(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const sessionStoreOptions = {
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
};

const sessionStore = new MySQLStore(sessionStoreOptions, connection);

app.use(session({
  secret: generateSecretKey(32), // Generate a 32-character random string for the secret key
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}));

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Query the database for the user
  const query = 'SELECT * FROM users WHERE username = ?';
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    // Check if user exists and password is correct
    if (results.length > 0 && results[0].password === password) {
      const userId = results[0].id;

      // Check if user already has two active sessions
      const activeSessionsQuery = 'SELECT COUNT(*) AS activeSessions FROM session WHERE user_id = ?';
      connection.query(activeSessionsQuery, [username], (err, activeSessionsResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const activeSessions = activeSessionsResult[0].activeSessions;
        if (activeSessions >= 2) {
          // Terminate existing active sessions for the user
          const terminateSessionsQuery = 'DELETE FROM session WHERE user_id = ?';
          connection.query(terminateSessionsQuery, [username], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ success: false, message: 'Failed to terminate existing sessions' });
            }
            // Insert a new row into the session table for the current login
            insertSession();
          });
        } else {
          // Insert a new row into the session table for the current login
          insertSession();
        }
      });

      function insertSession() {
        // Store user ID in session
        req.session.userId = userId;

        // Insert a new row into the session table
        const insertSessionQuery = 'INSERT INTO session (session_id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)';
        const sessionId = req.sessionID;
        const currentTime = new Date(); // Current time
        const expirationTime = new Date(currentTime.getTime() + (24 * 60 * 60 * 1000)); // Expiration time set to 24 hours from now
        connection.query(insertSessionQuery, [sessionId, username, currentTime, expirationTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Failed to update session table' });
          }
          // Send message to previous two tabs
          sendSessionExpiredMessage(username);
          return res.status(200).json({ success: true, message: 'Login successful' });
        });
      }
    } else {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  });
});
app.post('/squad_info', (req, res) => {
  const { team1Players, team2Players, team1, team2, matchID } = req.body;

  // Prepare the SQL query to insert data into the database
  const insertQuery = `
    INSERT INTO Squad_info (player_name, matchID, team, role)
    VALUES (?, ?, ?, ?)
  `;

  // Helper function to insert player data into the database
  const insertPlayerData = (playerData, teamName) => {
    playerData.forEach(({ name, role }) => {
      connection.query(
        insertQuery,
        [name, matchID, teamName, role],
        (error, results) => {
          if (error) {
            console.error('Error inserting player data:', error);
          }
        }
      );
    });
  };

  // Insert team 1 player data
  insertPlayerData(team1Players, team1);

  // Insert team 2 player data
  insertPlayerData(team2Players, team2);

  res.status(200).json({ message: 'Squad data saved successfully' });
});
// Function to send session expired message to previous two tabs
function sendSessionExpiredMessage(username) {
  // Query to get session IDs of the previous two sessions for the user
  const getPreviousSessionsQuery = 'SELECT session_id FROM session WHERE user_id = ? ORDER BY created_at ASC LIMIT 1';
  connection.query(getPreviousSessionsQuery, [username], (err, results) => {
    if (err) {
      console.error(err);
      // Log error or handle it as needed
      return;
    }

    // Assuming you have a way to send messages to the client-side, you can send a message to each session
    // Loop through the results and send the message to each session
    results.forEach((row) => {
      const sessionId = row.session_id;
      // Example: Send message to the client-side using WebSockets or Socket.IO
      // Here, you can implement your own logic to send a message to the client-side
      // For demonstration purposes, we'll log the message to the console
      console.log(`Session with session ID ${sessionId} for user ${username} has expired. Please log in again.`);
    });
  });
}


const generateMatchID = (matchInfo) => {
  const { date, team1, team2, venue } = matchInfo;
  const uniqueString = `${date}_${team1}_${team2}_${venue}`;
  // Use a hash function (e.g., SHA-256) to generate a unique identifier
  // For simplicity, we'll concatenate and hash the unique string
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(uniqueString).digest('hex');
};

app.post('/api/match_info', (req, res) => {
  const { matchID, ...matchInfo } = req.body;

  // Check if the provided MatchID already exists in the database
  const checkMatchIDQuery = 'SELECT * FROM match_info WHERE MatchID = ?';
  connection.query(checkMatchIDQuery, [matchID], (err, rows) => {
    if (err) {
      console.error('Error checking MatchID:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (rows.length > 0) {
      // MatchID already exists, return an error response
      console.error('MatchID already exists:', matchID);
      res.status(400).send('MatchID already exists');
      return;
    }

    // MatchID does not exist, proceed with insertion
    const sql = 'INSERT INTO match_info SET ?';
    connection.query(sql, { ...matchInfo, MatchID: matchID }, (err, result) => {
      if (err) {
        console.error('Error inserting match info:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Match info inserted successfully');
        res.status(200).send('Match info inserted successfully');
      }
    });
  });
});


app.get('/api/get_match_info', (req, res) => {
  // Fetch all Match_info data from the database
  const sql = 'SELECT * FROM match_info';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching Match_info data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { username, email, password } = req.body;

  // Check if the user already exists
  const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
  connection.query(checkQuery, [username, email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Insert the new user into the database
    const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    connection.query(insertQuery, [username, email, password], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(200).json({ message: 'User registered successfully' });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
