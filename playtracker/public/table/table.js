// Import the mysql package
const mysql = require('mysql');

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
  
  // Define the SQL query to alter the table structure
  const query = `
    CREATE TABLE IF NOT EXISTS match_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mID INT, -- New field
        batsman1 VARCHAR(255),
        batsman2 VARCHAR(255),
        batsman1_stats JSON,
        batsman2_stats JSON,
        bowler VARCHAR(255),
        bowler_stats JSON,
        score INT,
        extras JSON,
        overs DECIMAL(5, 1),
        strike_batsman INT,
        over_summary JSON,
        wickets INT,
        balls_bowled INT,
        batting_team VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mID) REFERENCES matches(id) -- Foreign key constraint referencing matches table
    )
  `;

  // Execute the SQL query
  connection.query(query, (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      return;
    }
    console.log('Table structure altered successfully');
    
    // Close the connection
    connection.end();
  });
});
