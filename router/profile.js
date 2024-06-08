import express from 'express';
import 'express-async-errors';
import { body } from 'express-validator';
import {validate} from '../middleware/validator.js';
import * as profileController from '../controller/profile.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isAuth, profileController.getProfile);
router.patch('/', isAuth, profileController.patchProfile);

export default router;