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

export { getAllOrganizations, getOrganizationDetails };