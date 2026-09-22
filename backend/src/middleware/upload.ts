import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// SVG is deliberately excluded — it can carry embedded scripts, and serving one
// from our own domain would make it an XSS vector.
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  // Memory, not disk: the buffer goes straight to R2, so it never needs to touch
  // the VM's filesystem.
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
      return;
    }
    cb(null, true);
  },
});

// multer surfaces rejections (bad type, oversized file) as thrown errors, which
// would otherwise land in app.ts's catch-all and become a 500. These are client
// mistakes, so translate them to 400 here instead.
export function uploadImage(req: Request, res: Response, next: NextFunction) {
  upload.single('image')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Image must be 5MB or smaller'
          : 'Invalid image upload';
      return res.status(400).json({ message });
    }

    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }

    next();
  });
}
