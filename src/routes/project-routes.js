import express from 'express';
import { listProjects, showProject } from '../controllers/project-controller.js';

const router = express.Router();

router.get('/', listProjects);
router.get('/:id', showProject);

export default router;