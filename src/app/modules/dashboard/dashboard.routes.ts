import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { DashboardController } from './dashboard.controller';
import { uploadFile } from '../../middlewares/fileUploader';

const router = express.Router();

// =============================
router.get('/get_total_count',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.totalCount,
);
router.get('/get_subscription_growth',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getMonthlySubscriptionGrowth,
);
router.get('/get_job_growth',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getMonthlyJobsGrowth,
);

// =============================
router.get('/get_all_user',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getAllUser,
);
router.post('/create_subscriptions',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.createSubscriptions,
);
router.patch('/update_subscriptions/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.updateSubscription,
);
router.delete('/delete_subscriptions/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.deleteSubscription,
);
router.get('/get_all_subscriptions',
  DashboardController.getAllSubscription,
);
router.get('/get_all_subscribers',
  DashboardController.getAllSubscriber,
);

// =========================================
router.post('/create-category',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  DashboardController.categoryInsertIntoDB,
);
router.get(
  '/all-category',
  DashboardController.allCategory,
);
router.patch(
  '/edit-category/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  DashboardController.updateCategory,
);
router.delete(
  '/delete-category/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.deleteCategory,
);
// Banner =========================================
router.post('/create-banner',
  // auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  DashboardController.bannerInsertIntoDB,
);
router.get(
  '/all-banner',
  DashboardController.allBanner,
);
router.patch(
  '/edit-banner/:id',
  // auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  DashboardController.updateBanner,
);
router.delete(
  '/delete-banner/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.deleteBanner,
);

router.post('/cookie-text',
  DashboardController.addTermsConditions,
);
router.get('/cookie-text',
  DashboardController.getTermsConditions,
);




// =========================================
router.get(
  '/all_employer',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getAllEmployer,
);
router.get(
  '/employer_details/:userId',
  // auth(ENUM_USER_ROLE.EMPLOYER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getEmployerDetails,
);

// =============
router.get(
  '/all_candidate',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getAllCandidate,
);
router.get(
  '/candidate_details/:userId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getCandidateDetails,
);
// =============================
router.get(
  '/get_all',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getAllJobs,
);
router.get(
  '/get_details/:jobId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getJobDetails,
);

// =============================== 
router.post(
  '/blog_create',
  uploadFile(),
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.createJob
);

router.patch(
  '/update_blog/:id',
  uploadFile(),
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.updateBlog
);

router.delete(
  '/delete_blog/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.deleteBlog
);
router.get(
  '/get_blog_details/:id',
  DashboardController.getBlogDetails
);
router.get(
  '/get_all_blogs',
  DashboardController.getAllBlogs
);
router.get(
  '/blog_details/:id',
  DashboardController.getBlogDetailsAndRelated
);
// ==========================
router.post('/addupdate-termsConditions',
  DashboardController.addTermsConditions,
);
router.get('/get-rules',
  DashboardController.getTermsConditions,
);
router.post('/addupdate-privacy-policy',
  DashboardController.addPrivacyPolicy,
);
router.get('/get-privacy-policy',
  DashboardController.getPrivacyPolicy,
);
router.post('/about_us',
  DashboardController.addAboutUs,
);
router.get('/about_us',
  DashboardController.getAboutUs,
);
// ===Home page website=============================  
router.post('/contact_us',
  DashboardController.postContactUs,
);
router.patch('/replay_contact_us/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.replayTheContactUs,
);
router.get('/contact_all',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getAllContactUs,
);


export const DashboardRoutes = router;
