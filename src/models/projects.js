import db from './db.js';

const getAllProjects = async () => {
    // LEFT JOIN keeps projects that have zero categories (an inner JOIN would hide them)
    const query = `
        SELECT
            project.project_id,
            project.project_name,
            project.description,
            project.location,
            project.project_date,
            organization.organization_name,
            COALESCE(
                STRING_AGG(category.category_name, ', ' ORDER BY category.category_name),
                'No categories'
            ) AS category_names
        FROM project
        JOIN organization ON project.organization_id = organization.organization_id
        LEFT JOIN project_category ON project.project_id = project_category.project_id
        LEFT JOIN category ON project_category.category_id = category.category_id
        GROUP BY project.project_id, organization.organization_name
        ORDER BY project.project_id
    `;
    const result = await db.query(query);
    return result.rows;
};

const getProjectDetails = async (projectId) => {
    const query = `
        SELECT
            project.project_id,
            project.project_name,
            project.description,
            project.location,
            project.project_date,
            project.organization_id,
            organization.organization_name
        FROM project
        JOIN organization ON project.organization_id = organization.organization_id
        WHERE project.project_id = $1
    `;
    const result = await db.query(query, [projectId]);
    return result.rows[0];
};

const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
        SELECT project_id, project_name, description
        FROM project
        WHERE organization_id = $1
        ORDER BY project_name
    `;
    const result = await db.query(query, [organizationId]);
    return result.rows;
};

const getProjectsByCategoryId = async (categoryId) => {
    const query = `
        SELECT project.project_id, project.project_name, project.description
        FROM project
        JOIN project_category ON project.project_id = project_category.project_id
        WHERE project_category.category_id = $1
        ORDER BY project.project_name
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows;
};

export { getAllProjects, getProjectDetails, getProjectsByOrganizationId, getProjectsByCategoryId };