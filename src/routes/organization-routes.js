import express from 'express';
import { listOrganizations, showOrganization } from '../controllers/organization-controller.js';

const router = express.Router();

router.get('/', listOrganizations);
router.get('/:id', showOrganization);

export default router;