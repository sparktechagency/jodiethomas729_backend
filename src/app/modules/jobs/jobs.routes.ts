import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { JobsController } from './jobs.controller';
import uploadC from '../../middlewares/cloudinaryUpload';

const router = express.Router();

router.post('/create-jobs',
    auth(ENUM_USER_ROLE.EMPLOYER, ENUM_USER_ROLE.ADMIN),
    JobsController.createNewJobs);
router.patch('/update-jobs/:id',
    auth(ENUM_USER_ROLE.EMPLOYER, ENUM_USER_ROLE.ADMIN),
    JobsController.updateJobs);
router.get('/all/employer',
    auth(ENUM_USER_ROLE.EMPLOYER, ENUM_USER_ROLE.ADMIN),
    JobsController.getEmployerJobs);
router.post('/apply/:jobId',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    uploadC.single('resume'),
    JobsController.applyJobs);
router.get('/applications',
    auth(ENUM_USER_ROLE.EMPLOYER, ENUM_USER_ROLE.ADMIN),
    JobsController.getJobsApplications);
router.get('/details',
    auth(ENUM_USER_ROLE.EMPLOYER, ENUM_USER_ROLE.ADMIN),
    JobsController.getJobsDetails);



export const JobsRoutes = router;