import cloudinary from '../../config/cloudinary';
import multer from 'multer';
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
            chunk_size: 50 * 1024 * 1024, // Cloudinary large file upload optimization
        };
    },
});

// ✅ Optional: File types allowed
const ALLOWED = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
];

const uploadC = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED.includes(file.mimetype)) {
            return cb(new Error('Unsupported file type'));
        }
        cb(null, true);
    },
});

export default uploadC;
