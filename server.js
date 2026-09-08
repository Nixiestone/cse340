import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { getAllOrganizations } from './src/models/organization-model.js';
import { getAllProjects } from './src/models/project-model.js';
import { getAllCategories } from './src/models/category-model.js';

const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

/**
 * Routes
 */
app.get('/', async (req, res) => {
    const title = 'Home';
    res.render('home', { title });
});

app.get('/organizations', async (req, res) => {
    const title = 'Our Partner Organizations';
    const organizations = await getAllOrganizations();
    res.render('organizations', { title, organizations });
});

app.get('/projects', async (req, res) => {
    const title = 'Service Projects';
    const projects = await getAllProjects();
    res.render('projects', { title, projects });
});

app.get('/categories', async (req, res) => {
    const title = 'Service Project Categories';
    const categories = await getAllCategories();
    res.render('categories', { title, categories });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});