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
router.patch('/make_expire_jobs/:id',
    auth(ENUM_USER_ROLE.EMPLOYER, ENUM_USER_ROLE.ADMIN),
    JobsController.makeExpireJobs);
router.get('/get_all_apply_candidate',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    JobsController.getAllApplyCandidate);
router.patch('/toggle_favorite/:jobId',
    auth(ENUM_USER_ROLE.USER),
    JobsController.toggleFavorite
);
router.get('/get_user_favorites_jobs',
    auth(ENUM_USER_ROLE.USER),
    JobsController.getUserFavoritesJobs
);
router.get('/candidate_overview',
    auth(ENUM_USER_ROLE.USER),
    JobsController.getCandidateOverview
);
router.get('/candidate_job_alert',
    auth(ENUM_USER_ROLE.USER),
    JobsController.getCandidateJobAlert
);
// =Home======================
router.get('/get_category_&count_jobs',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.EMPLOYER),
    JobsController.allCategoryWithJobs
);
router.get('/get_recent_jobs',
    JobsController.getRecentJobs
);
router.get('/get_search_filter',
    JobsController.getSearchFilterJobs
);
router.get('/get_details/:jobId',
    JobsController.getJobsDetailsForCandidate
);
// =======================================
router.get('/search_candidate',
    auth(ENUM_USER_ROLE.EMPLOYER, ENUM_USER_ROLE.ADMIN),
    JobsController.searchCandidate);
router.patch('/profile_access_request/:userId',
    auth(ENUM_USER_ROLE.EMPLOYER, ENUM_USER_ROLE.ADMIN),
    JobsController.profileAccessRequest
);
router.patch('/accept_access_request/:employerId',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    JobsController.acceptAccessRequest
);
router.get('/get_user_profile_details/:userId',
    auth(ENUM_USER_ROLE.EMPLOYER, ENUM_USER_ROLE.ADMIN),
    JobsController.getUserProfileDetails
);
router.patch('/toggle_user_favorite/:userId',
    auth(ENUM_USER_ROLE.EMPLOYER),
    JobsController.toggleUserFavorite
);
router.get('/get_favorites_user_list',
    auth(ENUM_USER_ROLE.EMPLOYER),
    JobsController.getUserFavoriteList
);
// =============================================

router.get('/total_count_employer',
    auth(ENUM_USER_ROLE.EMPLOYER),
    JobsController.getTotalCountEmployer
);

export const JobsRoutes = router;