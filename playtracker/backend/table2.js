const mysql = require('mysql');

// Create connection to the MySQL server
const connection = mysql.createConnection({
  host: 'localhost', // Change this to your MySQL server host
  user: 'root', // Change this to your MySQL username
  password: '', // Change this to your MySQL password
  database: 'test' // Change this to your MySQL database name
});

// Connect to MySQL server
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL server');

  // SQL query to create matchInfo table
  const createMatchInfoTable = `CREATE TABLE IF NOT EXISTS matchInfo (
    mID INT AUTO_INCREMENT PRIMARY KEY,
    Team1 VARCHAR(255),
    Team2 VARCHAR(255),
    venue VARCHAR(255),
    Description TEXT,
    mDate DATE,
    mTime TIME,
    createdDate DATE,
    modifiedDate DATE
  )`;

  // SQL query to create playerInfo table
  const createPlayerInfoTable = `CREATE TABLE IF NOT EXISTS playerInfo (
    pID INT AUTO_INCREMENT PRIMARY KEY,
    playerName VARCHAR(255),
    playerType VARCHAR(255),
    playerTeam VARCHAR(255),
    mID INT,
    createdDate DATE,
    modifiedDate DATE,
    FOREIGN KEY (mID) REFERENCES matchInfo(mID)
  )`;

  // Execute the queries to create tables
  connection.query(createMatchInfoTable, (err, result) => {
    if (err) throw err;
    console.log('matchInfo table created successfully');
  });

  connection.query(createPlayerInfoTable, (err, result) => {
    if (err) throw err;
    console.log('playerInfo table created successfully');
  });

  // Close connection
  connection.end((err) => {
    if (err) throw err;
    console.log('Connection to MySQL server closed');
  });
});
