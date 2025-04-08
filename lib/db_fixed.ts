// import oracledb from 'oracledb';

// const dbConfig = {
//   user: 'your_username', // replace with your Oracle DB username
//   password: 'your_password', // replace with your Oracle DB password
//   connectionString: 'your_connection_string' // replace with your Oracle DB connection string
// };

// export async function connectToDatabase() {
//   try {
//     const connection = await oracledb.getConnection(dbConfig);
//     console.log('Connected to Oracle Database');
//     return connection;
//   } catch (err) {
//     console.error('Database connection error:', err);
//     return null; // Return null if connection fails
//   }
// }

// export async function createTables(connection: oracledb.Connection) {
//   if (!connection) {
//     console.error('No database connection available');
//     return;
//   }

//   const createUsersTable = `
//     CREATE TABLE users (
//       id VARCHAR2(50) PRIMARY KEY,
//       name VARCHAR2(100),
//       department VARCHAR2(100)
//     )
//   `;

//   const createItemsTable = `
//     CREATE TABLE items (
//       id VARCHAR2(50) PRIMARY KEY,
//       name VARCHAR2(100),
//       purchasePrice NUMBER,
//       price NUMBER,
//       category VARCHAR2(100),
//       amount NUMBER
//     )
//   `;

//   try {
//     await connection.execute(createUsersTable);
//     await connection.execute(createItemsTable);
//     console.log('Tables created successfully');
//   } catch (err) {
//     console.error('Error creating tables:', err);
//   }
// }