import pool from '../config/database.js';

const getAllProjects = async () => {
    try {
        const query = `
            SELECT
                project.project_id,
                project.project_name,
                project.description,
                project.location,
                project.project_date,
                organization.organization_name,
                STRING_AGG(category.category_name, ', ') AS category_names
            FROM project
            JOIN organization ON project.organization_id = organization.organization_id
            JOIN project_category ON project.project_id = project_category.project_id
            JOIN category ON project_category.category_id = category.category_id
            GROUP BY project.project_id, organization.organization_name
            ORDER BY project.project_id
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
};

export { getAllProjects };