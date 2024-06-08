import * as profileRepository from '../data/profile.js';

export async function getProfile(req,res){
    const user = await profileRepository.findById(req.userId);
    if(!user){
        return res.status(404).json({isSuccess:false, code:404, message: '존재하지 않는 사용자입니다.'});
    }
    res.status(200).json({isSuccess: true,
        code: 200, 
        message:'요청에 성공하였습니다.', 
        result:{
            userId:user.id, 
            email:user.email, 
            nickname:user.nickname, 
            intro:user.intro, 
            url:user.url}});
};

export async function patchProfile(req, res){
    const userId = req.userId
    const user = await profileRepository.findById(userId);
    if(!user){
        return res.status(404).json({isSuccess:false, code:404, message: '존재하지 않는 사용자입니다.'});
    }
    //req에서 값 받아오기 
    const nickname = req.body.nickname;
    const intro = req.body.intro;
    const url = req.body.url;

    const updated = await profileRepository.update(userId, nickname, intro, url);
    
    res.status(200).json(
        {
            isSuccess:true,
            code:200,
            message:"사용자 정보가 수정되었습니다.",
            result:{
                userId: updated.id,
                email: updated.email,
                nickname: updated.nickname,
                intro: updated.intro,
                url: updated.url
            }
        });
}