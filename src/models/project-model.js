import pool from '../config/database.js';

const getAllProjects = async () => {
    try {
        const query = `
            SELECT project.*, organization.organization_name, category.category_name
            FROM project
            JOIN organization ON project.organization_id = organization.organization_id
            JOIN category ON project.category_id = category.category_id
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
};

export { getAllProjects };