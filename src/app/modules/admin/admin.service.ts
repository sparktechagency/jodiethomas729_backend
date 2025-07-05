import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import Auth from "../auth/auth.model";
import { Request } from "express";
import { IAdmin } from "./admin.interface";
import Admin from "./admin.model";
import { IReqUser } from "../auth/auth.interface";
import { ENUM_USER_ROLE } from "../../../enums/user";
import User from "../user/user.model";
import Employer from "../employer/employer.model";

interface IRequest extends Request {
  user: {
    userId: string;
    authId: string;
  };
};

const updateProfile = async (req: IRequest): Promise<IAdmin | null> => {
  const { files } = req as any;
  const { userId, authId } = req.user;

  const data = req.body;
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data is missing in the request body!");
  }

  const checkUser = await Admin.findById(userId);
  if (!checkUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const checkAuth = await Auth.findById(authId);
  if (!checkAuth) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  let profile_image: string | undefined;
  if (files?.profile_image) {
    profile_image = `/images/profile/${files.profile_image[0].filename}`;
  }
  const updatedData = {
    ...data,
    ...(profile_image && { profile_image }),
  };

  await Auth.findOneAndUpdate(
    { _id: authId },
    { name: updatedData.name },
    { new: true }
  );

  const updateUser = await Admin.findOneAndUpdate({ authId }, updatedData, {
    new: true,
  }).populate("authId");

  return updateUser;
};

const getAllAdmin = async () => {
  const admins = await Admin.find().sort({ createAt: -1 }).lean();
  return admins.map((admin) => ({
    ...admin,
    role: "Admin",
  }));
};


const deleteAuthAccount = async (user: IReqUser, email: string) => {
  const { authId } = user;

  const isUserExist = await Auth.findOne({ email }) as any;
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
  }

  if (isUserExist?._id.toString() === authId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, "You can't delete your own account!");
  }

  let result;
  switch (isUserExist?.role) {
    case ENUM_USER_ROLE.USER:
      result = await User.deleteOne({ email });
      break;
    case ENUM_USER_ROLE.ADMIN:
      result = await Admin.deleteOne({ email });
      break;
    case ENUM_USER_ROLE.EMPLOYER:
      result = await Employer.deleteOne({ email });
      break;
    default:
      throw new ApiError(httpStatus.NOT_FOUND, "User role not found!");
  }
  await Auth.deleteOne({ email });

  return { message: "Successfully deleted account." };
};

export const AdminService = {
  updateProfile,
  getAllAdmin,
  deleteAuthAccount
};


