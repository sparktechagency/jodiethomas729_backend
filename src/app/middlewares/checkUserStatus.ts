import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import Employer from '../modules/employer/employer.model';

export const checkUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as { userId: string };

    if (!userId) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized access' });
    }

    try {
        const user = await Employer.findById(userId);

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
        }

        if (user.subscription_status !== 'Active') {
            return res.status(httpStatus.FORBIDDEN).json({ message: 'Your subscription is not active.' });
        }

        next();
    } catch (error) {
        console.error('User status check failed:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
};
