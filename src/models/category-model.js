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

const getCategoryById = async (id) => {
    try {
        const query = 'SELECT * FROM category WHERE category_id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching category by id:', error);
        throw error;
    }
};

const getCategoriesByProjectId = async (projectId) => {
    try {
        const query = `
            SELECT category.category_id, category.category_name
            FROM category
            JOIN project_category ON category.category_id = project_category.category_id
            WHERE project_category.project_id = $1
            ORDER BY category.category_name
        `;
        const result = await pool.query(query, [projectId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching categories by project id:', error);
        throw error;
    }
};

export { getAllCategories, getCategoryById, getCategoriesByProjectId };