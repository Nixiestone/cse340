import { getAllProjects, getProjectById } from '../models/project-model.js';
import { getCategoriesByProjectId } from '../models/category-model.js';

const listProjects = async (req, res) => {
    const title = 'Service Projects';
    const projects = await getAllProjects();
    res.render('projects', { title, projects });
};

const showProject = async (req, res) => {
    const { id } = req.params;
    const project = await getProjectById(id);

    if (!project) {
        return res.status(404).render('404', { title: 'Not Found' });
    }

    const categories = await getCategoriesByProjectId(id);
    res.render('project-detail', { title: project.project_name, project, categories });
};

export { listProjects, showProject };