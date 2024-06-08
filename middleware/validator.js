import {validationResult} from 'express-validator';

export const validate = (req,res,next) => {
    const errors = validationResult(req); // (body, param 등) 요청 값을 읽고 등록한 유효성 검사를 실행 후, 에러 여부 반환
    if (errors.isEmpty()){
        return next(); // 만약에 에러가 없으면 다음 미들웨어로 이동
    }
    return res.status(400).json({message:errors.array()}) // 에러가 있으면 400 상태코드와 에러 메세지 반환
};
