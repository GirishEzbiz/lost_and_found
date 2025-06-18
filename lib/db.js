import mysql from "mysql2/promise";

// Global cache to persist pool across reloads in development
let pool;

if (!global._mysqlPool) {
  global._mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

pool = global._mysqlPool;

// Connection tester
const checkDbConnection = async () => {
  try {
    const [rows] = await pool.query("SELECT 1");
    console.log("✅ DB connection successful");
    return true;
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    return false;
  }
};

export const db = pool;
export { checkDbConnection };
