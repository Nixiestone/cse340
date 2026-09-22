import { getAllCategories, getCategoryById } from '../models/category-model.js';
import { getProjectsByCategoryId } from '../models/project-model.js';

const listCategories = async (req, res) => {
    const title = 'Service Project Categories';
    const categories = await getAllCategories();
    res.render('categories', { title, categories });
};

const showCategory = async (req, res) => {
    const { id } = req.params;
    const category = await getCategoryById(id);

    if (!category) {
        return res.status(404).render('404', { title: 'Not Found' });
    }

    const projects = await getProjectsByCategoryId(id);
    res.render('category-detail', { title: category.category_name, category, projects });
};

export { listCategories, showCategory };