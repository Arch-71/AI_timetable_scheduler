const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function runSqlFile(filePath) {
  // Read database configuration from your environment or config
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'timetable',
    multipleStatements: true
  });

  try {
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log('Executing SQL file:', filePath);
    const [results] = await connection.query(sql);
    
    console.log('SQL script executed successfully!');
    return results;
  } catch (error) {
    console.error('Error executing SQL script:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Get the SQL file path from command line arguments or use default
const sqlFile = process.argv[2] || path.join(__dirname, '02-time-slots.sql');

// Run the script
runSqlFile(sqlFile)
  .catch(console.error);
