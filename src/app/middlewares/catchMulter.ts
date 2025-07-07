import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import uploadC from './cloudinaryUpload';
import ApiError from '../../errors/ApiError';

export const resumeUpload = () => {
    const handler = uploadC.single('resume');

    return (req: Request, res: Response, next: NextFunction) => {
        let responded = false;

        handler(req, res, (err: any) => {
            if (responded) return;
            if (!err) return next();

            responded = true;

            // Multer
            if (err instanceof MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new ApiError(400, 'ফাইল ১০MB‑এর বেশি বড় (Cloudinary limit)'));
                }
                return next(new ApiError(400, err.message));
            }


            if (err.http_code && err.http_code !== 200) {
                return next(new ApiError(err.http_code, err.message));
            }


            return next(new ApiError(400, err.message || 'File upload failed'));
        });
    };
};
