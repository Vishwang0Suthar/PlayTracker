// server.js

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
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


// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both username and password' });
  }

  // Check if user exists in the database
  connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'An error occurred during login' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // User exists, return success message
    return res.status(200).json({ success: true, message: 'Login successful' });
  });
});




app.post('/api/match_info', (req, res) => {
  const { team1, team2, venue, time_s, match_description, date } = req.body;

  // Convert the date string to a Date object
  const dateObj = new Date(date);

  // Format the date as 'YYYY-MM-DD'
  const formattedDate = dateObj.toISOString().split('T')[0];

  // Insert data into matchInfo table
  const sql = `INSERT INTO matchInfo (Team1, Team2, venue, mTime, Description, mDate, createdDate, modifiedDate) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
  const values = [team1, team2, venue, time_s, match_description, formattedDate];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error occurred while inserting data into matchInfo table:', err);
      res.status(500).json({ error: 'An error occurred while processing your request' });
      return;
    }

    console.log('Data inserted successfully into matchInfo table');
    res.status(201).json({ id: result.insertId });
  });
});


//Inserting Squad Data 
app.post('/api/add_players', (req, res) => {
  const { team1Players, team2Players, team1, team2, mID } = req.body;

  // Insert team 1 players into the database
  team1Players.forEach(async (player, index) => {
    const sql = `INSERT INTO playerInfo (playerName, playerType, playerTeam, mID, createdDate, modifiedDate) VALUES (?, ?, ?, ?, NOW(), NOW())`;
    const values = [player.name, player.role, team1, mID];
    try {
      await connection.query(sql, values);
      // console.log(`Inserted player from team 1 into the database`);
    } catch (error) {
      console.error(`Error inserting player from team 1 into the database:`, error);
    }
  });

  // Insert team 2 players into the database
  team2Players.forEach(async (player, index) => {
    const sql = `INSERT INTO playerInfo (playerName, playerType, playerTeam, mID, createdDate, modifiedDate) VALUES (?, ?, ?, ?, NOW(), NOW())`;
    const values = [player.name, player.role, team2, mID];
    try {
      await connection.query(sql, values);
      //console.log(`Inserted player from team 2 into the database`);
    } catch (error) {
      console.error(`Error inserting player from team 2 into the database:`, error);
    }
  });

  res.status(201).json({ message: 'Player data inserted successfully' });
});


app.get('/api/players/:mID', (req, res) => {
  const mID = req.params.mID;
  const sql = `SELECT playerName FROM playerInfo WHERE mID = ?`;
  connection.query(sql, [mID], (err, results) => {
    if (err) {
      console.error('Error fetching player names:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    const playerNames = results.map((row) => row.playerName);
    res.json(playerNames);
  });
});

// Route to get match information
app.get('/api/get_match_info', (req, res) => {
  const query = 'SELECT mID, Team1, Team2, venue, Description, mDate, mTime FROM matchInfo';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching matches:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});



// Route to get player information based on match ID
app.get('/api/get_players/:matchID', (req, res) => {
  const matchID = req.params.matchID;
  const query = 'SELECT playerTeam, playerName, playerType FROM playerInfo WHERE mID = ?';
  connection.query(query, [matchID], (err, results) => {
    if (err) {
      console.error('Error fetching players:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    const teams = {};
    results.forEach(result => {
      if (!teams[result.playerTeam]) {
        teams[result.playerTeam] = { playerTeam: result.playerTeam, players: [] };
      }
      teams[result.playerTeam].players.push({ playerName: result.playerName, playerType: result.playerType });
    });
    const teamsArray = Object.values(teams);
    res.json(teamsArray);
  });
});


// Route to get squad information based on match ID
app.get('/api/get_squad/:matchID', (req, res) => {
  const matchID = req.params.matchID;
  const query = 'SELECT playerTeam, playerName, playerType FROM playerInfo WHERE mID = ?';
  connection.query(query, [matchID], (err, results) => {
    if (err) {
      console.error('Error fetching squad:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    const squad = {};
    results.forEach(result => {
      if (!squad[result.playerTeam]) {
        squad[result.playerTeam] = { playerTeam: result.playerTeam, players: [] };
      }
      squad[result.playerTeam].players.push({ playerName: result.playerName, playerType: result.playerType });
    });
    const squadArray = Object.values(squad);
    res.json(squadArray);
  });
});


// Signup endpoint
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  // Check if any field is empty
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: 'Please fill in all fields' });
  }

  // Check if user already exists
  connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: 'An error occurred during signup' });
    }

    if (results.length > 0) {
      return res.status(409).json({ success: false, error: 'Username already exists' });
    }

    // Insert new user into the database
    connection.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Failed to create user' });
      }
      return res.status(201).json({ success: true, message: 'User created successfully' });
    });
  });
});

app.post('/api/match/:mID/states', (req, res) => {
  const mID = req.params.mID;
  const {
    batsman1,
    batsman2,
    batsman1Stats,
    batsman2Stats,
    bowler,
    bowlerStats,
    score,
    extras,
    overs,
    strikeBatsman,
    overSummary,
    wickets,
    ballsBowled,
    battingTeam
  } = req.body;

  const insertQuery = `
    INSERT INTO match_data (
      batsman1,
      batsman2,
      batsman1_stats,
      batsman2_stats,
      bowler,
      bowler_stats,
      score,
      extras,
      overs,
      strike_batsman,
      over_summary,
      wickets,
      balls_bowled,
      batting_team
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const data = [
    batsman1,
    batsman2,
    JSON.stringify(batsman1Stats),
    JSON.stringify(batsman2Stats),
    bowler,
    JSON.stringify(bowlerStats),
    score,
    JSON.stringify(extras),
    overs,
    strikeBatsman,
    JSON.stringify(overSummary),
    wickets,
    ballsBowled,
    battingTeam
  ];

  connection.query(insertQuery, data, (err, result) => {
    if (err) {
      console.error('Error inserting data into match_data:', err);
      res.status(500).json({ error: 'Error inserting data into match_data' });
      return;
    }
    console.log('Data inserted successfully');
    res.sendStatus(200);
  });
});

const query = `
  SELECT *
  FROM match_data
  ORDER BY created_at DESC
  LIMIT 1
`;

// Query the database for the latest match data
connection.query(query, (err, results) => {
  if (err) {
    console.error('Error fetching data from MySQL:', err);
    return;
  }

  if (results.length === 0) {
    console.log('No data found in the match_data table');
    return;
  }

  // Send the latest match data as JSON response
  const latestData = results[0];
  res.json(latestData);
});






app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
