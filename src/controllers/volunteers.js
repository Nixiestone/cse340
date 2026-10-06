import { getProjectDetails } from '../models/projects.js';
import { addVolunteer, removeVolunteer } from '../models/volunteers.js';

// The biggest number a Postgres INT column can hold. Anything bigger would crash the query.
const MAX_INT = 2147483647;

/**
 * Turns the :id from the URL into a safe number, or null if it is not a real id.
 * Doing this first means junk like /volunteer/abc becomes a clean 404 instead of a database error.
 */
const parseProjectId = (value) => {
    const projectId = Number(value);
    if (!Number.isInteger(projectId) || projectId < 1 || projectId > MAX_INT) {
        return null;
    }
    return projectId;
};

/**
 * Builds a 404 error for the global error handler in server.js.
 */
const createNotFoundError = () => {
    const err = new Error('Project not found');
    err.status = 404;
    return err;
};

const processVolunteerSignup = async (req, res, next) => {
    const projectId = parseProjectId(req.params.id);
    if (!projectId) {
        return next(createNotFoundError());
    }

    const projectDetails = await getProjectDetails(projectId);
    if (!projectDetails) {
        return next(createNotFoundError());
    }

    // requireLogin guarantees req.session.user exists by the time we get here
    const userId = req.session.user.user_id;
    const wasAdded = await addVolunteer(userId, projectId);

    if (wasAdded) {
        req.flash('success', `You are now volunteering for ${projectDetails.project_name}. Thank you!`);
    } else {
        req.flash('info', `You are already volunteering for ${projectDetails.project_name}.`);
    }

    res.redirect(`/project/${projectId}`);
};

const processVolunteerRemoval = async (req, res, next) => {
    const projectId = parseProjectId(req.params.id);
    if (!projectId) {
        return next(createNotFoundError());
    }

    const projectDetails = await getProjectDetails(projectId);
    if (!projectDetails) {
        return next(createNotFoundError());
    }

    const userId = req.session.user.user_id;
    const wasRemoved = await removeVolunteer(userId, projectId);

    if (wasRemoved) {
        req.flash('success', `You are no longer volunteering for ${projectDetails.project_name}.`);
    } else {
        req.flash('info', `You were not volunteering for ${projectDetails.project_name}.`);
    }

    // The remove button exists on two pages, so send the user back to the page they came from.
    // We only accept the exact word 'dashboard' (never a URL) so nobody can use this to redirect elsewhere.
    // The ?. means "if req.body exists": a request with no form body at all leaves it undefined.
    if (req.body?.returnTo === 'dashboard') {
        return res.redirect('/dashboard');
    }
    res.redirect(`/project/${projectId}`);
};

export { processVolunteerSignup, processVolunteerRemoval };