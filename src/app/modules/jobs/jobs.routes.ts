import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { JobsController } from './jobs.controller';

const router = express.Router();

router.post('/create-jobs',
    auth(ENUM_USER_ROLE.EMPLOYER, ENUM_USER_ROLE.ADMIN),
    JobsController.createNewJobs);
router.patch('/update-jobs/:id',
    auth(ENUM_USER_ROLE.EMPLOYER, ENUM_USER_ROLE.ADMIN),
    JobsController.updateJobs);

export const JobsRoutes = router;