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

const getOrganizationById = async (id) => {
    try {
        const query = 'SELECT * FROM organization WHERE organization_id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching organization by id:', error);
        throw error;
    }
};

export { getAllOrganizations, getOrganizationById };