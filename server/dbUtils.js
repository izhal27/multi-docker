const keys = require('./keys');

// MariaDb Client Setup
const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: keys.dbHost,
  user: keys.dbUser,
  password: 'izhal',
  database: 'testing',
  connectionLimit: 5,
});

const query = async (str, ...args) => {
  let rows;
  let conn;

  try {
    conn = await pool.getConnection();
    rows = await conn.query(str, [...args]);
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release(); // release to pool
  }

  return rows;
};

module.exports = {
  async select(queryStr) {
    return query(queryStr);
  },
  async insert(table, ...args) {
    return query(`INSERT INTO ${table} VALUES (?)`, [...args]);
  },
};
