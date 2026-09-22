import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import organizationRoutes from './src/routes/organization-routes.js';
import projectRoutes from './src/routes/project-routes.js';
import categoryRoutes from './src/routes/category-routes.js';

const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.get('/', async (req, res) => {
    res.render('home', { title: 'Home' });
});

app.use('/organizations', organizationRoutes);
app.use('/projects', projectRoutes);
app.use('/categories', categoryRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
});