const mysql = require('mysql');

// MySQL connection configuration
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
});

// Create the match_data table
const createMatchDataTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS match_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    connection.query(query, (err, results, fields) => {
        if (err) {
            console.error('Error creating match_data table:', err);
            return;
        }
        console.log('match_data table created successfully.');
    });
};

// Call the function to create the table
createMatchDataTable();

// Close MySQL connection
connection.end();
