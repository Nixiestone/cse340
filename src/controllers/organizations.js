import { body, validationResult } from 'express-validator';
import {
    getAllOrganizations,
    getOrganizationDetails,
    createOrganization,
    updateOrganization
} from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

// Validation and sanitization rules for the organization form (used by create AND edit)
const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Organization name must be between 3 and 150 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Organization description is required')
        .isLength({ max: 500 })
        .withMessage('Organization description cannot exceed 500 characters'),
    body('contactEmail')
        .normalizeEmail()
        .notEmpty()
        .withMessage('Contact email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .isLength({ max: 150 })
        .withMessage('Contact email cannot exceed 150 characters')
];

// The edit form also has a logo filename field, so it gets the rules above plus one more
const editOrganizationValidation = [
    ...organizationValidation,
    body('logoFilename')
        .trim()
        .notEmpty()
        .withMessage('Logo filename is required')
        .isLength({ max: 150 })
        .withMessage('Logo filename cannot exceed 150 characters')
        .matches(/^[\w-]+\.(png|jpe?g|gif|svg|webp)$/i)
        .withMessage('Logo filename must look like "logo.png" (letters, numbers, - or _, ending in .png, .jpg, .jpeg, .gif, .svg or .webp)')
];

const showOrganizationsPage = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';
    res.render('organizations', { title, organizations });
};

const showOrganizationDetailsPage = async (req, res, next) => {
    const organizationId = req.params.id;
    const organizationDetails = await getOrganizationDetails(organizationId);

    if (!organizationDetails) {
        const err = new Error('Organization not found');
        err.status = 404;
        return next(err);
    }

    const projects = await getProjectsByOrganizationId(organizationId);
    const title = organizationDetails.organization_name;
    res.render('organization', { title, organizationDetails, projects });
};

const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';
    res.render('new-organization', { title });
};

const processNewOrganizationForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new organization form
        return res.redirect('/new-organization');
    }

    const { name, description, contactEmail } = req.body;
    const logoFilename = 'placeholder-logo.png'; // Use the placeholder logo for all new organizations

    const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
    req.flash('success', 'Organization added successfully!');
    res.redirect(`/organization/${organizationId}`);
};

const showEditOrganizationForm = async (req, res, next) => {
    const organizationId = req.params.id;
    const organizationDetails = await getOrganizationDetails(organizationId);

    if (!organizationDetails) {
        const err = new Error('Organization not found');
        err.status = 404;
        return next(err);
    }

    const title = 'Edit Organization';
    res.render('edit-organization', { title, organizationDetails });
};

const processEditOrganizationForm = async (req, res) => {
    const organizationId = req.params.id;

    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the edit organization form
        return res.redirect(`/edit-organization/${organizationId}`);
    }

    const { name, description, contactEmail, logoFilename } = req.body;

    await updateOrganization(organizationId, name, description, contactEmail, logoFilename);

    req.flash('success', 'Organization updated successfully!');
    res.redirect(`/organization/${organizationId}`);
};

export {
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm,
    organizationValidation,
    editOrganizationValidation
};