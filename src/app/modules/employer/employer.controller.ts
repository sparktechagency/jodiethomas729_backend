import { Request, Response } from "express";
import { EmployerService } from "./employer.service";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchasync";
import { IReqUser } from "../auth/auth.interface";

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployerService.updateMyProfile(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployerService.getProfile(req.user as IReqUser);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employer retrieved successfully",
    data: result,
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  await EmployerService.deleteEmployerAccount(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account deleted!",
  });
});


const getProfileIncompleteParent = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await EmployerService.getProfileIncompleteParent(user as IReqUser);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully!",
    data: result
  });
});


const updateMapLocationsEmployer = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployerService.updateMapLocationsEmployer(req as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Locations upload successfully.",
    data: result,
  });
});



export const EmployerController = {
  deleteMyAccount,
  getProfile,
  updateProfile,
  getProfileIncompleteParent,
  updateMapLocationsEmployer
};

