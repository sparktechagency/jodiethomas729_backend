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
            public_id: `${Date.now()}-${file.originalname}`,
        };
    },
});

const uploadC = multer({
    storage,
});

export default uploadC;
