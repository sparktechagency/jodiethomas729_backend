import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { Request } from "express";
import { RequestData } from "../../../interfaces/common";
import Auth from "../auth/auth.model";
import { IUser } from "./user.interface";
import User from "./user.model";

const updateMyProfile = async (req: RequestData): Promise<IUser> => {
  const { files, body: data } = req;
  const { userId, authId } = req.user;

  if (!Object.keys(data as any).length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Data is missing in the request body!"
    );
  }

  const checkUser = await User.findById(userId);

  if (!checkUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const checkAuth = await Auth.findById(authId);
  if (!checkAuth) {
    throw new ApiError(httpStatus.NOT_FOUND, "You are not authorized");
  }

  let profile_image: string | undefined = undefined;
  if (files && files.profile_image) {
    profile_image = `/images/profile/${files.profile_image[0].filename}`;
  }

  if (data?.educational_info) {
    data.educational_info = JSON.parse(data?.educational_info);
  }
  if (data?.work_experience) {
    data.work_experience = JSON.parse(data?.work_experience);
    console.log("=========", data?.work_experience)
  }
  if (data?.alert_job_type) {
    data.alert_job_type = JSON.parse(data?.alert_job_type);
  }
  if (data?.availability) {
    data.availability = JSON.parse(data?.availability);
  }
  if (data?.skill) {
    data.skill = JSON.parse(data?.skill);
  }
  if (data?.job_title) {
    data.job_title = JSON.parse(data?.job_title);
  }
  if (data?.job_seeking) {
    data.job_seeking = JSON.parse(data?.job_seeking);
  }

  const updatedData = { ...data };

  const [, updateUser] = await Promise.all([
    Auth.findByIdAndUpdate(
      authId,
      { name: updatedData.name, profile_image },
      {
        new: true,
      }
    ),
    User.findByIdAndUpdate(
      userId,
      { profile_image, ...updatedData },
      {
        new: true,
      }
    ).populate("authId"),
  ]);

  return updateUser as IUser;
};

const addWorkExperience = async (req: RequestData) => {
  const { body: newExperience } = req as any;
  const { userId } = req.user;

  const checkUser = await User.findById(userId);
  if (!checkUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const requiredFields = [
    "job_title",
    "company_name",
    "location",
    "start_date",
    "details"
  ];

  for (const field of requiredFields) {
    if (!newExperience[field]) {
      throw new ApiError(httpStatus.BAD_REQUEST, `${field} is required.`);
    }
  }

  console.log("newExperience", newExperience)

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        work_experience: newExperience,
      },
    },
    {
      new: true,
    }
  ).populate("authId");

  return { result: updatedUser?.work_experience }
};

const updateWorkExperience = async (req: any) => {
  const { body: updatedExperience } = req as any;
  const { userId } = req.user;
  const experienceId = req.params.experienceId;

  if (!experienceId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "_id of work experience is required.");
  }

  const checkUser = await User.findById(userId);
  if (!checkUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const requiredFields = [
    "job_title",
    "company_name",
    "location",
    "start_date",
    "details",
  ];

  for (const field of requiredFields) {
    if (!updatedExperience[field]) {
      throw new ApiError(httpStatus.BAD_REQUEST, `${field} is required.`);
    }
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, "work_experience._id": experienceId },
    {
      $set: {
        "work_experience.$.job_title": updatedExperience.job_title,
        "work_experience.$.company_name": updatedExperience.company_name,
        "work_experience.$.location": updatedExperience.location,
        "work_experience.$.start_date": updatedExperience.start_date,
        "work_experience.$.end_date": updatedExperience.end_date || null,
        "work_experience.$.details": updatedExperience.details,
      },
    },
    { new: true }
  ).populate("authId");

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Experience not found or failed to update.");
  }

  return { result: updatedUser.work_experience };
};


const deleteUSerAccount = async (payload: { email: string; password: string; }): Promise<void> => {
  const { email, password } = payload;

  const isUserExist = await Auth.isAuthExist(email);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
  }

  if (
    isUserExist.password &&
    !(await Auth.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password is incorrect");
  }

  await User.deleteOne({ authId: isUserExist._id });
  await Auth.deleteOne({ email });
};

const removeWorkExperience = async (req: RequestData) => {
  const { userId } = req.user;
  const { experienceId } = req.params as any;

  if (!experienceId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Experience ID is required.");
  }

  const checkUser = await User.findById(userId);
  if (!checkUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        work_experience: { _id: experienceId },
      },
    },
    { new: true }
  ).populate("authId");

  return { result: updatedUser?.work_experience }
};

const uploadCandidateCV = async (req: RequestData) => {
  const { userId } = req.user;

  const files = req.file;

  if (!files?.path) {
    new ApiError(httpStatus.NOT_FOUND, "Please check and upload your CV here!");
  }

  const resume_url = files.path;

  console.log("resume_url", resume_url)


  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        resume: resume_url,
      },
    },
    { new: true }
  ) as IUser;

  return { result: updatedUser?.resume }
};

const updateMapLocationsCandidate = async (req: RequestData) => {
  const { userId } = req.user;
  const { longitude, latitude } = req.body as { latitude: string, longitude: string };


  if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please send valid longitude and latitude!");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      locations: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
    },
    { new: true }
  ) as IUser;

  return { result: updatedUser?.locations };
};


export const UserService = {
  deleteUSerAccount,
  updateMyProfile,
  addWorkExperience,
  removeWorkExperience,
  uploadCandidateCV,
  updateMapLocationsCandidate,
  updateWorkExperience
};

