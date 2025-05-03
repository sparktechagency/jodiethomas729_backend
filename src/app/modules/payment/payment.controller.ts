import { Request, Response } from "express";
import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { PaymentServices } from "./payment.service";

const createCheckoutSessionStripe = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentServices.createCheckoutSessionStripe(req);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Create Checkout Session Successfully",
        data: result,
    });
});

const stripeCheckAndUpdateStatusSuccess = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentServices.stripeCheckAndUpdateStatusSuccess(req);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Update Session Successfully",
        data: result,
    });
});


const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentServices.getAllTransactions(req.query);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get Successfully",
        data: result,
    });
});




export const PaymentController = {
    createCheckoutSessionStripe,
    stripeCheckAndUpdateStatusSuccess,
    getAllTransactions
}