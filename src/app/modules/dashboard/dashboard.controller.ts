import { Request, RequestHandler, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchasync';
import { DashboardService } from './dashboard.service';
import { IBlog, ICategory, ISubscriptions } from './dsashbaord.interface';
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

const getMonthlyJobsGrowth: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const year = req.query.year
      ? parseInt(req.query.year as string, 10)
      : undefined;
    const result = await DashboardService.getMonthlyJobsGrowth(year);
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

const getAllSubscriber: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await DashboardService.getAllSubscriber(query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Get successfully`,
      data: result,
    });
  },
);

// ===============================================================
const categoryInsertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.categoryInsertIntoDB(req.files, req.body);
  sendResponse<ICategory>(res, {
    statusCode: 200,
    success: true,
    message: 'Category create successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.updateCategory(req);
  sendResponse<ICategory>(res, {
    statusCode: 200,
    success: true,
    message: 'Category update successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.deleteCategory(req.params.id);
  sendResponse<ICategory>(res, {
    statusCode: 200,
    success: true,
    message: 'Category delete successfully',
    data: result,
  });
});

const allCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.allCategory(req.query);
  sendResponse<ICategory[]>(res, {
    statusCode: 200,
    success: true,
    message: 'Category Retrieved successfully',
    data: result.data,
  });
});

// ===========================
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
const addAboutUs = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.addAboutUs(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});

const getAboutUs = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getAboutUs();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});

const checkActiveSubscriber = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IReqUser;
  const result = await DashboardService.checkActiveSubscriber(user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});
// ===================================
const getAllEmployer = catchAsync(async (req: Request, res: Response) => {
  const query = req.query
  const result = await DashboardService.getAllEmployer(query as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});

const getEmployerDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const query = req.query;
  const result = await DashboardService.getEmployerDetails(query, userId as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});
// =======================
const getAllCandidate = catchAsync(async (req: Request, res: Response) => {
  const query = req.query
  const result = await DashboardService.getAllCandidate(query as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});

const getCandidateDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const query = req.query;
  const result = await DashboardService.getCandidateDetails(query as any, userId as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});


const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await DashboardService.getAllJobs(query as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});

const getJobDetails = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  const query = req.query;
  const result = await DashboardService.getJobDetails(query as any, jobId as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});

const createJob = catchAsync(async (req: Request, res: Response) => {
  const jobData = req.body as IBlog;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };


  const imageFiles = files?.image || [];

  if (Array.isArray(imageFiles)) {
    jobData.image = imageFiles.map(file => file.path);
  }
  const result = await DashboardService.createBlog(jobData);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Job created successfully',
    data: result,
  });
});

const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updateData = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const imageFiles = files?.image || [];

  if (Array.isArray(imageFiles) && imageFiles.length > 0) {
    const newImagePaths = imageFiles.map(file => file.path);

    const existingImages = Array.isArray(updateData.image)
      ? updateData.image
      : updateData.image
        ? [updateData.image]
        : [];

    updateData.image = [...existingImages, ...newImagePaths];
  }

  const result = await DashboardService.updateBlog(id, updateData);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Job updated successfully',
    data: result,
  });
});

const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await DashboardService.deleteBlog(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Job deleted successfully',
    data: result,
  });
});


const getBlogDetails = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const query = req.query;
  const result = await DashboardService.getBlogDetails(query as any, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Job fetched successfully',
    data: result,
  });
});


// const getAllJobs = catchAsync(async (req: Request, res: Response) => {
//   const query = req.query;
//   const result = await DashboardService.getAllJobs(query as any);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Jobs fetched successfully',
//     data: result,
//   });
// });



export const DashboardController = {
  getAllUser,
  createSubscriptions,
  updateSubscription,
  deleteSubscription,
  getAllSubscription,
  categoryInsertIntoDB,
  updateCategory,
  deleteCategory,
  allCategory,
  addTermsConditions,
  getTermsConditions,
  addPrivacyPolicy,
  getPrivacyPolicy,
  totalCount,
  getMonthlySubscriptionGrowth,
  getMonthlyJobsGrowth,
  addAboutUs,
  getAboutUs,
  getAllSubscriber,
  checkActiveSubscriber,
  getAllEmployer,
  getEmployerDetails,
  getAllCandidate,
  getCandidateDetails,
  getAllJobs,
  getJobDetails,
  createJob,
  updateBlog,
  deleteBlog,
  getBlogDetails
};
