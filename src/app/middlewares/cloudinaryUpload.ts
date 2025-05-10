import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary';

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const fileType = file.mimetype.startsWith('video')
            ? 'video'
            : file.mimetype.startsWith('application') || file.mimetype === 'text/plain'
                ? 'raw'
                : 'image';

        return {
            folder: 'real_estate',
            resource_type: fileType,
            allowed_formats: [
                'jpg', 'jpeg', 'png', 'gif',
                'mp4', 'avi', 'mov',
                'pdf', 'doc', 'docx', 'odt', 'rtf', 'txt'
            ],
            public_id: `${Date.now()}-${file.originalname}`,
        };
    },
});

const uploadC = multer({
    storage,
    fileFilter: (req, file, cb) => {
        console.log('Uploading:', file.originalname);

        const allowedMimeTypes = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.oasis.opendocument.text',
            'application/rtf',
            'text/plain',
            'video/mp4', 'video/avi', 'video/mov'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
        }
    },
});

export default uploadC;
