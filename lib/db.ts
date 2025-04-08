import sql from "mssql";

const dbConfig: sql.config = {
  server: "PC-21408\\MSSQLSERVER01", // Use double backslashes for escaping
  database: "Cantene",
  
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true, // Set to true for local development
  },
};

// Function to connect to the database
export async function connectToDatabase() {
  console.log("Attempting to connect to:", dbConfig.server, "Database:", dbConfig.database);
  try {
    const pool = await sql.connect(dbConfig);
    console.log("Connected to database:", dbConfig.database);
    
    // Ensure tables are created
    await createTables(pool);
    
    return pool;
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw new Error("Database connection failed");
  }
}



// Function to create tables
export async function createTables(pool: sql.ConnectionPool) {
  const queries = [
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
     CREATE TABLE users (
      id NVARCHAR(50) PRIMARY KEY,
      name NVARCHAR(100),
      department NVARCHAR(100)
    );`,
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='items' AND xtype='U')
     CREATE TABLE items (
      id NVARCHAR(50) PRIMARY KEY,
      name NVARCHAR(100),
      purchasePrice FLOAT,
      price FLOAT,
      category NVARCHAR(100),
      amount INT
    );`,
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='purchases' AND xtype='U')
     CREATE TABLE purchases (
      id NVARCHAR(50) PRIMARY KEY,
      userId NVARCHAR(50),
      itemId NVARCHAR(50),
      quantity INT,
      date DATE,
      total FLOAT,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (itemId) REFERENCES items(id)
    );`,
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='expenses' AND xtype='U')
     CREATE TABLE expenses (
      id NVARCHAR(50) PRIMARY KEY,
      name NVARCHAR(100),
      amount FLOAT,
      date DATE,
      category NVARCHAR(100)
    );`,
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='cashTransactions' AND xtype='U')
     CREATE TABLE cashTransactions (
      id NVARCHAR(50) PRIMARY KEY,
      amount FLOAT,
      description NVARCHAR(100),
      date DATE,
      type NVARCHAR(50)
    );`
  ];

  try {
    for (const query of queries) {
      await pool.request().query(query);
    }
    console.log("Tables created successfully");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}

// Export default for easy import
export default { connectToDatabase };
