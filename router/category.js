import express from 'express';
import 'express-async-errors';
import { body } from 'express-validator';
import {validate} from '../middleware/validator.js';
import * as categoryController from '../controller/category.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

//유효성 검사 추가하기
router.post('/', isAuth, categoryController.createCategory);
router.get('/', isAuth, categoryController.getAllCategory);
router.put('/:id', isAuth, categoryController.updateCategory);
router.delete('/:id', isAuth, categoryController.deleteCategory);

export default router;