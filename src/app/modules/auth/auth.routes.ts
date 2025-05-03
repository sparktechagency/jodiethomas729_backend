import express, { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { uploadFile } from '../../middlewares/fileUploader';
import { AdminController } from '../admin/admin.controller';
import { AuthController } from './auth.controller';
import { UserController } from '../user/user.controller';

const router = express.Router();
//------ Auth Route -----------------
router.post("/register",
  // uploadFile(),
  AuthController.registrationAccount)
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
  AuthController.changePassword
)

router.delete("/delete-account", AuthController.deleteMyAccount)
router.patch("/block", AuthController.blockUnblockAuthUser)

//------ User Router ---------------
router.get("/profile", auth(ENUM_USER_ROLE.USER), UserController.getProfile)

//------ Admin Router ---------------
router.get(
  "/profile",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.myProfile
);
router.patch(
  "/edit-profile",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  AdminController.updateProfile
);
router.delete(
  "/delete-account",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.deleteMyAccount
);

export const AuthRoutes = router;
