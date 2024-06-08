import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import authRouter from './router/auth.js';
import profileRouter from './router/profile.js';
import categoryRouter from './router/category.js';
import presignedRouter from './router/presigned.js';
import speakingRouter from './router/speaking.js';
import testRouter from './router/test.js';

import { config } from './config.js';
import {db} from './db/database.js';


const app = express(); 

const corsOption = {
    origin: config.cors.allowedOrigin,
    optionSuccessStatus: 200,
};

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors(corsOption));
app.use(morgan('tiny'));


// 라우터 나열
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/category', categoryRouter);
app.use('/presigned', presignedRouter);
app.use('/speaking', speakingRouter);
app.use('/test', testRouter);

// 에러 처리 
// 지원하지 않는 API 요청 시
app.use((req,res,next)=>{ 
    res.sendStatus(404);
});
// 에러 발생 시 
app.use((error,req,res,next) => {
    console.error(error); 
    res.sendStatus(500); 
});


db.getConnection();

app.listen(config.port);

