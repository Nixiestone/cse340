import pool from '../config/database.js';

const getAllOrganizations = async () => {
    try {
        const query = 'SELECT * FROM organization';
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching organizations:', error);
        throw error;
    }
};

export { getAllOrganizations };