const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest = uploadDir;
        
        if (file.fieldname === 'photo' || file.fieldname === 'profile_photo') {
            dest = path.join(uploadDir, 'photos');
        } else if (file.fieldname === 'evidence' || file.fieldname === 'class_photo') {
            dest = path.join(uploadDir, 'evidence');
        } else if (file.fieldname === 'csv' || file.fieldname === 'import_file') {
            dest = path.join(uploadDir, 'imports');
        } else if (file.fieldname === 'certificate') {
            dest = path.join(uploadDir, 'certificates');
        } else if (file.fieldname === 'report_attachment') {
            dest = path.join(uploadDir, 'reports');
        }
        
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedDocTypes = ['text/csv', 'application/pdf', 'application/vnd.ms-excel'];
    
    if (file.fieldname === 'photo' || file.fieldname === 'profile_photo' || file.fieldname === 'evidence') {
        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
        }
    } else if (file.fieldname === 'csv' || file.fieldname === 'import_file') {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'), false);
        }
    } else {
        cb(null, true);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10
    }
});

module.exports = upload;
