import { Request, RequestHandler, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchasync';
import { DashboardService } from './dashboard.service';
import { IAdds, ISubscriptions } from './dsashbaord.interface';
import { Subscription } from './dashboard.model';
import { IReqUser } from '../auth/auth.interface';



const totalCount: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DashboardService.totalCount();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Get all count sucess!`,
      data: result,
    });
  },
);
const getMonthlySubscriptionGrowth: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const year = req.query.year
      ? parseInt(req.query.year as string, 10)
      : undefined;
    const result = await DashboardService.getMonthlySubscriptionGrowth(year);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Get all count sucess!`,
      data: result,
    });
  },
);

const getMonthlyUserGrowth: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const year = req.query.year
      ? parseInt(req.query.year as string, 10)
      : undefined;
    const result = await DashboardService.getMonthlyUserGrowth(year);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Get all count sucess!`,
      data: result,
    });
  },
);


const getAllUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query as any;
    const result = await DashboardService.getAllUser(query as any);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Get all user!`,
      data: result,
    });
  },
);

const createSubscriptions: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const body = req.body as any;
    const result = await DashboardService.createSubscriptions(body as any);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Create Sucessfully!`,
      data: result,
    });
  },
);

const updateSubscription: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const body = req.body as ISubscriptions;
    const id = req.params.id
    const result = await DashboardService.updateSubscription(id as string, body as ISubscriptions);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Update Sucessfully!`,
      data: result,
    });
  },
);

const deleteSubscription: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id
    const result = await DashboardService.deleteSubscription(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Delate sucessfully`,
      data: result,
    });
  },
);

const getAllSubscription: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await Subscription.find();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Delate sucessfully`,
      data: result,
    });
  },
);

// ===============================================================

const addsInsertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.addsInsertIntoDB(req.files, req.body);
  sendResponse<IAdds>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds create successfully',
    data: result,
  });
});

const updateAdds = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.updateAdds(req);
  sendResponse<IAdds>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds update successfully',
    data: result,
  });
});

const deleteAdds = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.deleteAdds(req.params.id);
  sendResponse<IAdds>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds delete successfully',
    data: result,
  });
});

const allAdds = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.allAdds(req.query);
  sendResponse<IAdds[]>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds Retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});
// ===========================
const addFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.addFaq(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully create!',
    data: result,
  });
});
const updateFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.updateFaq(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully Update!',
    data: result,
  });
});
const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.deleteFaq(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully Delete!',
    data: result,
  });
});
const getFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getFaq();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully get!',
    data: result,
  });
});

const addTermsConditions = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.addTermsConditions(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});
const getTermsConditions = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getTermsConditions();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});
const addPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.addPrivacyPolicy(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});
const getPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getPrivacyPolicy();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});
// ================================


export const DashboardController = {
  getAllUser,
  createSubscriptions,
  updateSubscription,
  deleteSubscription,
  getAllSubscription,
  addsInsertIntoDB,
  updateAdds,
  deleteAdds,
  allAdds,
  getFaq,
  deleteFaq,
  updateFaq,
  addFaq,
  addTermsConditions,
  getTermsConditions,
  addPrivacyPolicy,
  getPrivacyPolicy,
  totalCount,
  getMonthlySubscriptionGrowth,
  getMonthlyUserGrowth,


};
