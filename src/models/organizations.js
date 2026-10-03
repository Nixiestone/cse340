import db from './db.js';

const getAllOrganizations = async () => {
    const query = `
        SELECT organization_id, organization_name, contact_email, description, logo
        FROM organization
        ORDER BY organization_name
    `;
    const result = await db.query(query);
    return result.rows;
};

const getOrganizationDetails = async (organizationId) => {
    const query = `
        SELECT organization_id, organization_name, contact_email, description, logo
        FROM organization
        WHERE organization_id = $1
    `;
    const result = await db.query(query, [organizationId]);
    return result.rows[0];
};

/**
 * Creates a new organization in the database.
 * @param {string} name - The name of the organization.
 * @param {string} description - A description of the organization.
 * @param {string} contactEmail - The contact email for the organization.
 * @param {string} logoFilename - The filename of the organization's logo.
 * @returns {number} The id of the newly created organization record.
 */
const createOrganization = async (name, description, contactEmail, logoFilename) => {
    const query = `
        INSERT INTO organization (organization_name, description, contact_email, logo)
        VALUES ($1, $2, $3, $4)
        RETURNING organization_id
    `;
    const queryParams = [name, description, contactEmail, logoFilename];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create organization');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new organization with ID:', result.rows[0].organization_id);
    }

    return result.rows[0].organization_id;
};

/**
 * Updates an existing organization in the database.
 * @returns {number} The id of the updated organization record.
 */
const updateOrganization = async (organizationId, name, description, contactEmail, logoFilename) => {
    const query = `
        UPDATE organization
        SET organization_name = $1, description = $2, contact_email = $3, logo = $4
        WHERE organization_id = $5
        RETURNING organization_id
    `;
    const queryParams = [name, description, contactEmail, logoFilename, organizationId];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Organization not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated organization with ID:', organizationId);
    }

    return result.rows[0].organization_id;
};

export { getAllOrganizations, getOrganizationDetails, createOrganization, updateOrganization };