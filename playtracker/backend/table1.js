const mysql = require('mysql');

// Create a connection to the MySQL server
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
});

// Connect to the MySQL server
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
  
  // SQL query to create the table
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Squad_info (
      Player_name VARCHAR(255),
      matchID INT,
      team VARCHAR(255),
      Role VARCHAR(255)
    )
  `;
  
  // Execute the query to create the table
  connection.query(createTableQuery, (err, results, fields) => {
    if (err) {
      console.error('Error creating table: ' + err.stack);
      return;
    }
    console.log('Squad_info table created successfully.');
    
    // Close the connection
    connection.end();
  });
});
