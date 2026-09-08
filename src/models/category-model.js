import pool from '../config/database.js';

const getAllCategories = async () => {
    try {
        const query = 'SELECT * FROM category';
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export { getAllCategories };