import jwt from 'jsonwebtoken';
import * as userRepository from '../data/auth.js';
import {config} from '../config.js';

const AUTH_ERROR = {message: 'Authentication Error'};


// 유저 인증 함수 
export const isAuth = async (req,res,next) => { 
    const authHeader = req.get('Authorization'); // req헤더 안에 Authorization키의 값을 authHeader에 저장
    if(!(authHeader && authHeader.startsWith('Bearer '))){ 
        return res.status(401).json(AUTH_ERROR);
    }
    

    const token = authHeader.split(' ')[1];

    
    jwt.verify( // 토큰이 유효한지 확인
        token, 
        config.jwt.secretKey,
        async (error, decoded) => {
            if(error){
                return res.status(401).json({isSuccess: false,
                    code: 401, 
                    message:'유효하지 않은 사용자입니다.'});
            }
            const user = await userRepository.findById(decoded.id); //userRepository에 있는 모든 함수는 비동기 함수이므로 async-await 문법 사용 
            if(!user){
                return res.status(401).json({isSuccess: false,
                    code: 401, 
                    message:'유효하지 않은 사용자입니다.'});
            }
            req.userId = user.id; // req.customData 등록 
            req.token = token;
            next();
        }
    );
};