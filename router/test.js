import express from 'express';
import 'express-async-errors';
import * as speakingController from '../controller/speaking.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isAuth, speakingController.testGpt);

export default router;