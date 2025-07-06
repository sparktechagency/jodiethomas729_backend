import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { RequestData } from "../../../interfaces/common";
import Auth from "../auth/auth.model";
import { IEmployer } from "./employer.interface";
import Employer from "./employer.model";
import { IReqUser } from "../auth/auth.interface";

const updateMyProfile = async (req: RequestData): Promise<IEmployer> => {
  const { files, body: data } = req as any;
  const { userId, authId } = req.user;

  if (!Object.keys(data as IEmployer).length && !files) {
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

  // Parse and merge company data
  if (data?.company && typeof data.company === "string") {
    data.company = JSON.parse(data.company);
  }

  if (data?.company && typeof data.company === "object") {
    data.company = {
      ...checkEmployer.company?.toObject?.(), // existing company data
      ...data.company,                        // new values override
    };
  } else if (!data.company && files?.company_logo?.[0]?.filename) {
    // Only logo is being updated
    data.company = { ...checkEmployer.company?.toObject?.() };
  }

  // Update company logo path if new file is uploaded
  if (files?.company_logo?.[0]?.filename) {
    const companyLogoPath = `/images/image/${files.company_logo[0].filename}`;
    if (!data.company || typeof data.company !== "object") {
      data.company = {};
    }
    data.company.company_logo = companyLogoPath;
  }

  // Parse and merge socialMedia data
  if (data?.socialMedia && typeof data.socialMedia === "string") {
    data.socialMedia = JSON.parse(data.socialMedia);
  }

  if (data?.socialMedia && typeof data.socialMedia === "object") {
    data.socialMedia = {
      ...checkEmployer.socialMedia?.toObject?.(),
      ...data.socialMedia,
    };
  }

  const updatedData = { ...data };

  const [, updateEmployer] = await Promise.all([
    Auth.findByIdAndUpdate(
      authId,
      { name: updatedData.name, profile_image },
      { new: true }
    ),
    Employer.findByIdAndUpdate(
      userId,
      { profile_image, ...updatedData },
      { new: true }
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
    throw new ApiError(httpStatus.BAD_REQUEST, "Password is incorrect");
  }

  await Employer.deleteOne({ authId: isEmployerExist._id });
  await Auth.deleteOne({ email });
};

const getProfileIncompleteParent = async (user: IReqUser) => {
  const { userId } = user;

  const employer = await Employer.findById(userId);
  if (!employer) {
    throw new Error("Employer not found");
  }

  // Define important profile fields
  const profileFields = [
    employer.name,
    employer.email,
    employer.phone_number,
    employer.profile_image,
    employer.years_of_establishment,
    employer.company?.company_logo,
    employer.company?.name,
    employer.company?.employer_position,
    employer.company?.locations,
    employer.company?.details,
    employer.company?.website_link,
    employer.socialMedia?.website,
    employer.socialMedia?.linkedin,
    employer.socialMedia?.instagram,
    employer.socialMedia?.facebook,
  ];

  const totalFields = profileFields.length;
  const filledFields = profileFields.filter((field) => field !== null && field !== undefined && field !== "").length;

  const completedPercent = Math.round((filledFields / totalFields) * 100);
  const incompletePercent = 100 - completedPercent;

  return {
    completedPercent,
    incompletePercent,
    totalFields,
  };
};

const updateMapLocationsEmployer = async (req: RequestData) => {
  const { userId } = req.user;
  const { longitude, latitude } = req.body as { latitude: string, longitude: string };


  if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please send valid longitude and latitude!");
  }

  const updatedUser = await Employer.findByIdAndUpdate(
    userId,
    {
      locations: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
    },
    { new: true }
  ) as IEmployer;

  return { result: updatedUser?.locations };
};


export const EmployerService = {
  getProfile,
  deleteEmployerAccount,
  updateMyProfile,
  getProfileIncompleteParent,
  updateMapLocationsEmployer
};

