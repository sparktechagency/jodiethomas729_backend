import { Request, Response } from "express";
import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { JobsServices } from "./jobs.service";
import { IReqUser } from "../auth/auth.interface";
import { IJobs } from "./jobs.interface";

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


export const JobsController = {
    createNewJobs,
    updateJobs
}