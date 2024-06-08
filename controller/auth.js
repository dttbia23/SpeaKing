import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {} from 'express-async-errors';
import * as userRepository from '../data/auth.js';
import {config} from '../config.js';




export async function signup(req, res){
    const {email, password, nickname, intro, url} = req.body;
    const found = await userRepository.findByEmail(email);
    if(found){
        return res.status(409).json({message:'이미 사용중인 이메일 입니다.'});
    }
    const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
    const userId = await userRepository.createUser({
        email,
        password: hashed,
        nickname,
        intro,
        url
    });
    const token = createJwtToken(userId);

    res.status(201).json({isSuccess: true,
        code: 201, 
        message:'회원가입에 성공했습니다.', 
        result:{token, userId}});
}




export async function login (req,res){
    const {email, password} = req.body;
    const user = await userRepository.findByEmail(email); // 유저 이메일(아이디) 검사
    if(!user){ //유저 이메일 틀렸거나 존재하지 않으면 401 에러
        return res.status(401).json({isSuccess: false, code:401, message: '이메일 혹은 비밀번호가 올바르지 않습니다.'});
    }
    // 사용자가 입력한 패스워드와 데이터베이스에 저장된 유저 패스워드 비교
    const isValidPassword = await bcrypt.compare(password, user.password);
    if(!isValidPassword){ // 유저 비밀번호가 틀림
        return res.status(401).json({isSuccess: false, code:401, message: '이메일 혹은 비밀번호가 올바르지 않습니다.'});
    }
    // 이메일 패스워드 맞으면 -> jwt 토큰 생성
    const token = createJwtToken(user.id); 
    const userId = user.id;
    res.status(200).json({isSuccess: true,
        code: 200, 
        message:'로그인에 성공했습니다.', 
        result:{token, userId}});
} 



function createJwtToken(id){
    return jwt.sign({id}, config.jwt.secretKey, {
        expiresIn: config.jwt.expiresInSec});
}



export async function me(req,res,next){
    const user = await userRepository.findById(req.userId);
    if(!user){
        return res.status(404).json({isSuccess:false, code:404, message: '존재하지 않는 사용자입니다.'});
    }
    res.status(200).json({isSuccess: true,
        code: 200, 
        message:'유효한 사용자 입니다.', 
        result:{token:req.token, userId:user.id}});
}


export async function signout(req,res,next){
    const {password} = req.body; 
    const user = await userRepository.findById(req.userId);
    // 사용자가 입력한 패스워드와 데이터베이스에 저장된 유저 패스워드 비교
    const isValidPassword = await bcrypt.compare(password, user.password);
    if(!isValidPassword){ // 유저 비밀번호가 틀림
        return res.status(401).json({isSuccess: false, code:401, message: '비밀번호가 올바르지 않습니다.'});
    }

    //db에서 유저 정보 삭제하고 결과 반환
    await userRepository.removeUser(req.userId);
    res.status(200).json({isSuccess: true,
        code: 200, 
        message:'회원 탈퇴가 완료되었습니다.',});
}