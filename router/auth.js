import express from 'express';
import 'express-async-errors';
import { body } from 'express-validator';
import {validate} from '../middleware/validator.js';
import * as authController from '../controller/auth.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();


// 유효성 검사
const validateCredential = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('올바른 이메일 형식이 아닙니다.'),
    body('password')
        .trim()
        .isLength({min:8}) // 비밀번호 최소 8자 이상
        .withMessage('비밀번호는 8자 이상부터 사용 가능합니다.'),
    validate
];


const validateSignup = [
    ...validateCredential,
    body('nickname')
        .trim()
        .notEmpty()
        .withMessage('닉네임을 한 글자 이상 입력해주세요.'),
    body('intro')
        .trim()
        .isLength({max:20}) // 한줄 소개는 최대 20자
        .withMessage('한줄 소개는 최대 20자까지만 가능합니다.')
        .optional({nullable:true, checkFalsy:true}), 
    body('url')
        .isURL()
        .withMessage('invalid URL')
        .optional({nullable:true, checkFalsy:true}), //데이터가 없거나, 값이 없는 문자열일 경우도 허용
        validate
];

router.post('/signup', validateSignup, authController.signup); //isAuth 필요x 

router.post('/login', validateCredential, authController.login);


/*사용자가 유효한지, 토큰이 만료되지는 않았는지 확인해주는 api
사용자가 유효하고 & 토큰이 만료되지 않음 -> 사용자 반환, 다른 api들 호출해주면 됨
유효하지않은 사용자거나 토큰이 만료 -> 로그인 페이지로 이동 */
router.get('/me', isAuth, authController.me); //isAuth 실행 필요


router.delete('/signout', isAuth, 
    [
        body('password')
        .trim()
        .isLength({min:8}) // 비밀번호 최소 8자 이상
        .withMessage('비밀번호는 8자 이상부터 사용 가능합니다.'),
        validate
    ]
, authController.signout);



export default router;