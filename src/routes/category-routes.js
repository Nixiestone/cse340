import express from 'express';
import { listCategories, showCategory } from '../controllers/category-controller.js';

const router = express.Router();

router.get('/', listCategories);
router.get('/:id', showCategory);

export default router;