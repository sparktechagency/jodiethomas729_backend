import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import ApiError from '../../errors/ApiError';
import uploadC from './cloudinaryUpload';

export const resumeUpload = () => {
    const handler = uploadC.single('resume');

    return (req: Request, res: Response, next: NextFunction) => {
        handler(req, res, (err: any) => {
            if (!err) return next();

            // Multer built‑in
            if (err instanceof MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new ApiError(400, 'File size exceeds server limit'));
                }
                return next(new ApiError(400, err.message));
            }

            // Cloudinary (has http_code when fail)
            if (err.http_code && err.http_code !== 200) {
                return next(new ApiError(err.http_code, err.message));
            }

            // Unknown
            return next(new ApiError(400, err.message || 'File upload failed'));
        });
    };
};
