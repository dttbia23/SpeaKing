import * as categoryRepository from '../data/category.js';


// 카테고리 생성
export async function createCategory(req,res){
    const name = req.body.name;
    const userId = req.userId;
    const category = await categoryRepository.create(name, userId);
    res.status(201).json({
        isSuccess: true,
        code: 201, 
        message:'카테고리를 성공적으로 생성했습니다.', 
        result:{
            categoryId : category.id,
            name: category.name,
            userId}
        }
    );
};


// 카테고리 목록 조회
export async function getAllCategory(req,res){
    const userId = req.userId;
    const categorys = await categoryRepository.getAll(userId);
    res.status(200).json({
        isSuccess: true,
        code: 200, 
        message:'카테고리를 성공적으로 불러왔습니다.', 
        result: categorys
        }
    );
};


// 카테고리 수정
export async function updateCategory(req,res){
    const id = req.params.id;
    const name = req.body.name;
    const userId = req.userId;
    const category = await categoryRepository.getById(id);
    if(!category){ //잘못된 아이디 집어넣어서 카테고리가 존재하지 않으면
        return res.status(404).json({
            isSuccess: false,
            code: 404, 
            message:'해당 카테고리는 존재하지 않습니다.', 
        });
    }
    if(category.userId !== req.userId){
        return res.status(403).json({
            isSuccess: false,
            code: 403, 
            message:'카테고리를 수정할 권한이 없습니다.', 
        });
    }
    const updated = await categoryRepository.update(id, name);
    res.status(200).json({
        isSuccess: true,
        code: 200, 
        message:'카테고리 이름이 수정되었습니다.', 
        result:{
            categoryId : updated.id,
            name: updated.name,
            userId}
        });
};


// 카테고리 삭제
export async function deleteCategory(req,res){
    const id = req.params.id;
    const category = await categoryRepository.getById(id);
    if(!category){ //잘못된 아이디 집어넣어서 카테고리가 존재하지 않으면
        return res.status(404).json({
            isSuccess: false,
            code: 404, 
            message:'해당 카테고리는 존재하지 않습니다.', 
        });
    }
    if(category.userId !== req.userId){
        return res.status(403).json({
            isSuccess: false,
            code: 403, 
            message:'카테고리를 삭제할 권한이 없습니다.', 
        });
    }
    await categoryRepository.removeCategory(id);
    res.status(200).json({isSuccess: true,
        code: 200, 
        message:'해당 카테고리가 삭제되었습니다.',});
};