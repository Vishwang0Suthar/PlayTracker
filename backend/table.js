const mysql = require('mysql');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
});
// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
  
  // SQL query to create Squad table
  const createSquadTableQuery = `
    CREATE TABLE Squad (
      SquadID INT AUTO_INCREMENT PRIMARY KEY,
      MatchID INT,
      Team VARCHAR(255) NOT NULL,
      PlayerName VARCHAR(255) NOT NULL,
      Role ENUM('Bat', 'Bowl', 'All Round'),
      FOREIGN KEY (MatchID) REFERENCES match_info(MatchID)
    )`;

  // Execute the query to create Squad table
  connection.query(createSquadTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating Squad table:', err);
    } else {
      console.log('Squad table created successfully');
    }
    // Close MySQL connection
    connection.end();
  });
});
