import AWS from 'aws-sdk';
import { config } from '../config.js';


const s3 = new AWS.S3({
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretAccessKey,
    region: 'ap-northeast-2',
});

export async function getPreSignUrl(req,res,next){
    const filename = req.query.filename;
    const userId = req.userId;

    const params = { 
        Bucket: config.aws.bucketName, //버킷 이름
        Key: `${userId}/${filename}`, //디렉토리, 파일이름
        Expires: 60 * 60 * 3,
    };
    const signedUrlPut = await s3.getSignedUrlPromise("putObject", params);
    res.status(200).json({isSuccess: true,
        code: 200, 
        message:'preSignedURL이 생성되었습니다.',
        result:signedUrlPut});
}