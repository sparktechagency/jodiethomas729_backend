
import cloudinary from '../../config/cloudinary';
import multer, { MulterError } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import ApiError from '../../errors/ApiError';

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => {
        const resource = file.mimetype.startsWith('video')
            ? 'video'
            : file.mimetype.startsWith('application') || file.mimetype === 'text/plain'
                ? 'raw'
                : 'image';

        return {
            folder: 'real_estate',
            resource_type: resource,
            public_id: `${Date.now()}-${file.originalname}`,
            chunk_size: 50 * 1024 * 1024
        };
    },
});

const ALLOWED = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
];

const uploadC = multer({
    storage,
    limits: { fileSize: 0 },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED.includes(file.mimetype)) {
            // @ts-ignore
            return cb(new ApiError(400, 'Unsupported file type'), false);
        }
        cb(null, true);
    }
});

export default uploadC;
