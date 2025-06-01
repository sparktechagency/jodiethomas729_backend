import express, { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { uploadFile } from '../../middlewares/fileUploader';
import { AdminController } from '../admin/admin.controller';
import { AuthController } from './auth.controller';
import { UserController } from '../user/user.controller';
import { EmployerController } from '../employer/employer.controller';
import { DashboardController } from '../dashboard/dashboard.controller';
import uploadC from '../../middlewares/cloudinaryUpload';

const router = express.Router();
//------ Auth Route -----------------
router.post("/register", AuthController.registrationAccount)
router.post("/login", AuthController.loginAccount)
router.post("/activate-user", AuthController.activateAccount)
router.post("/active-resend", AuthController.resendCodeActivationAccount)
router.post("/resend", AuthController.resendActivationCode)
router.post("/forgot-password", AuthController.forgotPass)
router.post("/forgot-resend", AuthController.resendCodeForgotAccount)
router.post("/verify-otp", AuthController.checkIsValidForgetActivationCode)
router.post("/reset-password", AuthController.resetPassword)
router.patch("/change-password",
  auth(
    ENUM_USER_ROLE.USER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN
  ),
  AuthController.changePassword);
router.delete("/delete-account", AuthController.deleteMyAccount);
router.patch("/block",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AuthController.blockUnblockAuthUser);

router.get("/profile",
  auth(ENUM_USER_ROLE.EMPLOYER, ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AuthController.myProfile);

//------ User Router --------------- 
router.patch(
  "/user/edit-profile",
  auth(ENUM_USER_ROLE.USER),
  uploadFile(),
  UserController.updateProfile);

//------ User Router --------------- 
router.patch(
  "/employer/edit-profile",
  auth(ENUM_USER_ROLE.EMPLOYER),
  uploadFile(),
  EmployerController.updateProfile);

//------ Admin Router --------------- 
router.patch(
  "/admin/edit-profile",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  AdminController.updateProfile
);
router.delete(
  "/delete-auth-account",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.deleteAuthAccount
);

router.get(
  "/get_all_admin",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.getAllAdmin
);

router.get(
  "/check_subscriber_status",
  auth(ENUM_USER_ROLE.EMPLOYER),
  DashboardController.checkActiveSubscriber
);

router.get(
  "/employer/profile_incomplete_parent",
  auth(ENUM_USER_ROLE.EMPLOYER),
  EmployerController.getProfileIncompleteParent);

router.patch(
  "/add_work_experience",
  auth(ENUM_USER_ROLE.USER),
  UserController.addWorkExperience);
router.patch(
  "/remove_work_experience/:experienceId",
  auth(ENUM_USER_ROLE.USER),
  UserController.removeWorkExperience);

router.patch(
  "/candidate_resume_upload",
  auth(ENUM_USER_ROLE.USER),
  uploadC.single('resume'),
  UserController.uploadCandidateCV);

router.patch(
  "/candidate_map_locations_update",
  auth(ENUM_USER_ROLE.USER),
  UserController.updateMapLocationsCandidate);




export const AuthRoutes = router;
