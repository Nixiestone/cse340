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
    // project_date_input is the date as YYYY-MM-DD text, which is the format an
    // <input type="date"> needs in order to be pre-filled on the edit form
    const query = `
        SELECT
            project.project_id,
            project.project_name,
            project.description,
            project.location,
            project.project_date,
            TO_CHAR(project.project_date, 'YYYY-MM-DD') AS project_date_input,
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

/**
 * Creates a new service project.
 * @returns {number} The id of the newly created project.
 */
const createProject = async (title, description, location, date, organizationId) => {
    const query = `
        INSERT INTO project (project_name, description, location, project_date, organization_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING project_id
    `;
    const queryParams = [title, description, location, date, organizationId];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create project');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new project with ID:', result.rows[0].project_id);
    }

    return result.rows[0].project_id;
};

/**
 * Updates a service project, including which organization it belongs to.
 * @returns {number} The id of the updated project.
 */
const updateProject = async (projectId, title, description, location, date, organizationId) => {
    const query = `
        UPDATE project
        SET project_name = $1, description = $2, location = $3, project_date = $4, organization_id = $5
        WHERE project_id = $6
        RETURNING project_id
    `;
    const queryParams = [title, description, location, date, organizationId, projectId];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Project not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated project with ID:', projectId);
    }

    return result.rows[0].project_id;
};

export {
    getAllProjects,
    getProjectDetails,
    getProjectsByOrganizationId,
    getProjectsByCategoryId,
    createProject,
    updateProject
};