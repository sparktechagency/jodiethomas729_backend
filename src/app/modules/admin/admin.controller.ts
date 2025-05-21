import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import { AdminService } from './admin.service';
import sendResponse from '../../../shared/sendResponse';
import { IReqUser } from '../auth/auth.interface';

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.updateProfile(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully.",
    data: result,
  });
});


const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllAdmin();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully.",
    data: result,
  });
});

const deleteAuthAccount = catchAsync(async (req: Request, res: Response) => {
  const email = req.query.email as string

  const user = req.user as IReqUser;
  const result = await AdminService.deleteAuthAccount(user, email as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account deleted successfully.",
    data: result,
  });
});





export const AdminController = {
  updateProfile,
  getAllAdmin,
  deleteAuthAccount
};