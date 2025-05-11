import { Request, Response } from "express";
import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { JobsServices } from "./jobs.service";
import { IReqUser } from "../auth/auth.interface";
import { IApplications, IJobs } from "./jobs.interface";

const createNewJobs = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await JobsServices.createNewJob(user as IReqUser, payload as IJobs);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Create new jobs successfully",
        data: result,
    });
});

const updateJobs = catchAsync(async (req: Request, res: Response) => {
    const jobId = req.params.id;
    const payload = req.body;
    const result = await JobsServices.updateJobs(jobId as any, payload as IJobs);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Update jobs successfully",
        data: result,
    });
});

const getEmployerJobs = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const user = req.user;
    const result = await JobsServices.getEmployerJobs(user as any, query as any);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get jobs successfully",
        data: result,
    });
});

const applyJobs = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body as IApplications;
    const user = req.user as IReqUser;
    const jobId = req.params.jobId;
    const files = req.file;
    const result = await JobsServices.applyJobs(jobId as any, user as IReqUser, payload as IApplications, files as any);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Application Successfully",
        data: result,
    });
});

const getJobsApplications = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const user = req.user;
    const result = await JobsServices.getJobsApplications(user as any, query as any);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Applications jobs successfully",
        data: result,
    });
});

const getJobsDetails = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const user = req.user;
    const result = await JobsServices.getJobsDetails(query as any);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Jobs details successfully",
        data: result,
    });
});

const makeExpireJobs = catchAsync(async (req: Request, res: Response) => {
    const body = req.body;
    const id = req.params.id;
    const result = await JobsServices.makeExpireJobs(id as any, body as any);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Status ${body?.status} - Update Successfully`,
        data: result,
    });
});

const getAllApplyCandidate = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const user = req.user;
    const result = await JobsServices.getAllApplyCandidate(user as IReqUser, query as any);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get successfully",
        data: result,
    });
});

const toggleFavorite = catchAsync(async (req: Request, res: Response) => {
    const { authId } = req.user as IReqUser;
    const jobId = req.params.jobId;
    const result = await JobsServices.addRemoveFavorites(authId as any, jobId as any);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result,
    });
});

const getUserFavorites = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IReqUser;
    const result = await JobsServices.getUserFavorites(user);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Successful',
        data: result,
    });
});

const getCandidateOverview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IReqUser;
    const result = await JobsServices.getCandidateOverview(user);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Successful',
        data: result,
    });
});

const getCandidateJobAlert = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IReqUser;
    const query = req.query as any;
    const result = await JobsServices.getCandidateJobAlert(user, query as any);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Successful',
        data: result,
    });
});

const allCategoryWithJobs = catchAsync(async (req: Request, res: Response) => {
    const result = await JobsServices.allCategoryWithJobs();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Successful',
        data: result,
    });
});

const getRecentJobs = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await JobsServices.getRecentJobs(query as any);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Successful',
        data: result,
    });
});

const getSearchFilterJobs = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await JobsServices.getSearchFilterJobs(query as any);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Successful',
        data: result,
    });
});


export const JobsController = {
    createNewJobs,
    updateJobs,
    getEmployerJobs,
    applyJobs,
    getJobsApplications,
    getJobsDetails,
    makeExpireJobs,
    getAllApplyCandidate,
    toggleFavorite,
    getUserFavorites,
    getCandidateOverview,
    getCandidateJobAlert,
    allCategoryWithJobs,
    getRecentJobs,
    getSearchFilterJobs
}