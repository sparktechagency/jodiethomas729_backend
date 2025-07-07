import { Request } from 'express';
import Notification from './notifications.model';
import ApiError from '../../../errors/ApiError';
import { IReqUser } from '../auth/auth.interface';

//Get
const getNotifications = async (user: IReqUser) => {
  const { userId } = user;
  const allNotification = await Notification.find({ userId }).sort({
    createdAt: -1,
  });
  return {
    allNotification,
  };
};

const deleteNotifications = async (req: Request) => {
  const id = req.params.id;
  const allNotification = await Notification.deleteOne({ _id: id });
  return {
    allNotification,
  };
};

//Update
const updateNotification = async (req: Request) => {
  const id = req.params.id;

  const notification = await Notification.findById(id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  const result = await Notification.findByIdAndUpdate(
    { _id: id },
    { $set: { status: true } },
    { new: true },
  ).sort({ createdAt: -1 });
  return result;
};

const updateAll = async () => {
  const result = await Notification.updateMany(
    { status: false },
    { $set: { status: true } },
    { new: true },
  ).sort({ createdAt: -1 });
  return result;
};



export const NotificationService = {
  getNotifications,
  updateNotification,
  updateAll,
  deleteNotifications,
};
