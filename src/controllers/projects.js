import { body, validationResult } from 'express-validator';
import {
    getAllProjects,
    getProjectDetails,
    createProject,
    updateProject
} from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';
import { isUserVolunteer } from '../models/volunteers.js';
import { getAllOrganizations, getOrganizationDetails } from '../models/organizations.js';

// Validation and sanitization rules for the project form (used by create AND edit)
const projectValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Title must be between 3 and 150 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required')
        .isLength({ max: 150 })
        .withMessage('Location must be 150 characters or fewer'),
    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .isISO8601({ strict: true })
        .withMessage('Date must be a valid date'),
    body('organizationId')
        .notEmpty()
        .withMessage('Organization is required')
        .isInt()
        .withMessage('Organization must be a valid integer')
        .bail() // stop here if it is not an integer, so the check below never queries with junk
        .custom(async (value) => {
            const organization = await getOrganizationDetails(value);
            if (!organization) {
                throw new Error('The selected organization does not exist');
            }
            return true;
        })
];

const showProjectsPage = async (req, res) => {
    const projects = await getAllProjects();
    const title = 'Service Projects';
    res.render('projects', { title, projects });
};

const showProjectDetailsPage = async (req, res, next) => {
    const projectId = req.params.id;
    const projectDetails = await getProjectDetails(projectId);

    if (!projectDetails) {
        const err = new Error('Project not found');
        err.status = 404;
        return next(err);
    }

    const categories = await getCategoriesByProjectId(projectId);

    // Only logged-in users can volunteer, so only look the answer up for them
    const user = req.session.user;
    let isVolunteer = false;
    if (user) {
        isVolunteer = await isUserVolunteer(user.user_id, projectId);
    }

    const title = projectDetails.project_name;
    res.render('project', { title, projectDetails, categories, isVolunteer });
};

const showNewProjectForm = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Add New Service Project';
    res.render('new-project', { title, organizations });
};

const processNewProjectForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new project form
        return res.redirect('/new-project');
    }

    const { title, description, location, date, organizationId } = req.body;

    const newProjectId = await createProject(title, description, location, date, organizationId);

    req.flash('success', 'New service project created successfully!');
    res.redirect(`/project/${newProjectId}`);
};

const showEditProjectForm = async (req, res, next) => {
    const projectId = req.params.id;
    const projectDetails = await getProjectDetails(projectId);

    if (!projectDetails) {
        const err = new Error('Project not found');
        err.status = 404;
        return next(err);
    }

    // The dropdown needs every organization so the project can be moved to a different one
    const organizations = await getAllOrganizations();
    const title = 'Edit Service Project';
    res.render('edit-project', { title, projectDetails, organizations });
};

const processEditProjectForm = async (req, res) => {
    const projectId = req.params.id;

    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the edit project form
        return res.redirect(`/edit-project/${projectId}`);
    }

    const { title, description, location, date, organizationId } = req.body;

    await updateProject(projectId, title, description, location, date, organizationId);

    req.flash('success', 'Service project updated successfully!');
    res.redirect(`/project/${projectId}`);
};

export {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm,
    projectValidation
};