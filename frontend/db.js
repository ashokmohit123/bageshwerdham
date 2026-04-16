// db.js
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "dhamsan",
  password: "0yawKsDPZu8C",
  database: "dhamsan_bageshwar"
});

// ✅ Promise wrapper use karo
//const db = pool.promise();

export default db;


