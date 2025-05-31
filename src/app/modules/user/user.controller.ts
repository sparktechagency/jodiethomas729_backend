import { Request, Response } from "express";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchasync";

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateMyProfile(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully.",
    data: result,
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  await UserService.deleteUSerAccount(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account deleted!",
  });
});

const addWorkExperience = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.addWorkExperience(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Add successfully.",
    data: result,
  });
});

const removeWorkExperience = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.removeWorkExperience(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Delete successfully.",
    data: result,
  });
});



export const UserController = {
  deleteMyAccount,
  updateProfile,
  addWorkExperience,
  removeWorkExperience
};

