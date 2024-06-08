import express from 'express';
import 'express-async-errors';
import * as presignedController from '../controller/presigned.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isAuth, presignedController.getPreSignUrl);

export default router;