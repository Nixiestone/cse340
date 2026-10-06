import db from './db.js';

/**
 * Signs a user up to volunteer for a project.
 * If the user is already signed up, nothing changes (no error, no duplicate row).
 * @param {number} userId - The id of the logged-in user.
 * @param {number} projectId - The id of the project.
 * @returns {boolean} true if a new signup was created, false if they were already volunteering.
 */
const addVolunteer = async (userId, projectId) => {
    // ON CONFLICT DO NOTHING uses the (user_id, project_id) primary key to ignore repeat signups
    const query = `
        INSERT INTO volunteer (user_id, project_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, project_id) DO NOTHING
    `;
    const result = await db.query(query, [userId, projectId]);

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log(`User ${userId} volunteer signup for project ${projectId}, rows added:`, result.rowCount);
    }

    return result.rowCount > 0;
};

/**
 * Removes a user from a project's volunteers.
 * @param {number} userId - The id of the logged-in user.
 * @param {number} projectId - The id of the project.
 * @returns {boolean} true if a signup was removed, false if the user was not volunteering.
 */
const removeVolunteer = async (userId, projectId) => {
    const query = `
        DELETE FROM volunteer
        WHERE user_id = $1 AND project_id = $2
    `;
    const result = await db.query(query, [userId, projectId]);

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log(`User ${userId} removed from project ${projectId}, rows deleted:`, result.rowCount);
    }

    return result.rowCount > 0;
};

/**
 * Checks whether a user is currently volunteering for a project.
 * @returns {boolean} true if the user has signed up for the project.
 */
const isUserVolunteer = async (userId, projectId) => {
    const query = `
        SELECT 1
        FROM volunteer
        WHERE user_id = $1 AND project_id = $2
    `;
    const result = await db.query(query, [userId, projectId]);
    return result.rows.length > 0;
};

/**
 * Gets every project a user has volunteered for (used by the dashboard).
 * @param {number} userId - The id of the logged-in user.
 * @returns {Array} Projects with their organization name, soonest project first.
 */
const getVolunteerProjectsByUserId = async (userId) => {
    const query = `
        SELECT
            project.project_id,
            project.project_name,
            project.location,
            project.project_date,
            organization.organization_name
        FROM volunteer
        JOIN project ON volunteer.project_id = project.project_id
        JOIN organization ON project.organization_id = organization.organization_id
        WHERE volunteer.user_id = $1
        ORDER BY project.project_date, project.project_name
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

export {
    addVolunteer,
    removeVolunteer,
    isUserVolunteer,
    getVolunteerProjectsByUserId
};