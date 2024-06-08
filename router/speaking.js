import express from 'express';
import 'express-async-errors';
import * as speakingController from '../controller/speaking.js';
import { isAuth } from '../middleware/auth.js';


const router = express.Router();

router.post('/', isAuth, speakingController.createSpeaking);
router.get('/', isAuth, speakingController.getSpeaking);
router.get('/:id', isAuth, speakingController.getSpeakingById);
router.delete('/:id', isAuth, speakingController.deleteSpeaking);


export default router;