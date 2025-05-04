import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { Request } from "express";
import { RequestData } from "../../../interfaces/common";
import Auth from "../auth/auth.model";
import { IEmployer } from "./employer.interface";
import Employer from "./employer.model";

const updateMyProfile = async (req: RequestData): Promise<IEmployer> => {
  const { files, body: data } = req;
  const { userId, authId } = req.user;
  if (!Object.keys(data as IEmployer).length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Data is missing in the request body!"
    );
  }

  const checkEmployer = await Employer.findById(userId);

  if (!checkEmployer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employer not found!");
  }

  const checkAuth = await Auth.findById(authId);
  if (!checkAuth) {
    throw new ApiError(httpStatus.NOT_FOUND, "You are not authorized");
  }

  let profile_image: string | undefined = undefined;
  if (files && files.profile_image) {
    profile_image = `/images/profile/${files.profile_image[0].filename}`;
  }

  if (data?.company) {
    data.company = JSON.parse(data?.company);
  }
  if (data?.socialMedia) {
    data.socialMedia = JSON.parse(data?.socialMedia);
  }

  const updatedData = { ...data };
  const [, updateEmployer] = await Promise.all([
    Auth.findByIdAndUpdate(
      authId,
      { name: updatedData.name },
      {
        new: true,
      }
    ),
    Employer.findByIdAndUpdate(
      userId,
      { profile_image, ...updatedData },
      {
        new: true,
      }
    ).populate("authId"),
  ]);

  return updateEmployer as IEmployer;
};

const getProfile = async (user: { userId: string }): Promise<IEmployer> => {
  const { userId } = user;
  const result = await Employer.findById(userId).populate("authId");
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employer not found");
  }

  const auth = await Auth.findById(result.authId);
  if (auth?.is_block) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are blocked. Contact support");
  }

  return result;
};

const deleteEmployerAccount = async (payload: { email: string; password: string; }): Promise<void> => {
  const { email, password } = payload;

  const isEmployerExist = await Auth.isAuthExist(email);
  if (!isEmployerExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employer does not exist");
  }

  if (
    isEmployerExist.password &&
    !(await Auth.isPasswordMatched(password, isEmployerExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }

  await Employer.deleteOne({ authId: isEmployerExist._id });
  await Auth.deleteOne({ email });
};

export const EmployerService = {
  getProfile,
  deleteEmployerAccount,
  updateMyProfile,
};

