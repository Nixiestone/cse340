import { getAllOrganizations, getOrganizationById } from '../models/organization-model.js';

const listOrganizations = async (req, res) => {
    const title = 'Our Partner Organizations';
    const organizations = await getAllOrganizations();
    res.render('organizations', { title, organizations });
};

const showOrganization = async (req, res) => {
    const { id } = req.params;
    const organization = await getOrganizationById(id);

    if (!organization) {
        return res.status(404).render('404', { title: 'Not Found' });
    }

    res.render('organization-detail', { title: organization.organization_name, organization });
};

export { listOrganizations, showOrganization };