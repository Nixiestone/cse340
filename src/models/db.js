import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
});

pool.on('error', (err) => {
    console.error('Unexpected idle client error:', err.message);
});

// Runs a tiny query at startup so we find out immediately if the database is unreachable
const testConnection = async () => {
    const result = await pool.query('SELECT NOW() AS current_time');
    console.log('Database connected at:', result.rows[0].current_time);
    return true;
};

export default pool;
export { testConnection };