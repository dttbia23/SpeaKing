import * as speakingRepository from '../data/speaking.js';



// 스피킹 생성
export async function createSpeaking(req,res){
    
    const userId = req.userId;
    const title = req.body.title;
    const text = req.body.text; //STT text 원본
    const categoryId = req.body.categoryId;
    const categoryName = req.body.categoryName;
    const speakingUuid = req.body.speakingUuid;
    const saveDate = req.body.saveDate;
    const url = req.body.url;
    const time = req.body.time;
    const pronunciation = req.body.pronunciation;
    const speed = req.body.speed;
    const selectedformality = req.body.selectedformality;


    
    try {
        const correctedText = await speakingRepository.chatGPT(text); //GPT 호출 후, 반환 텍스트 저장 
        
        //스피킹 생성하고 speakingId반환
        const speakingId = await speakingRepository.create(userId, categoryId, categoryName, speakingUuid, title, saveDate, text, correctedText, url, time, pronunciation, speed, selectedformality);


        //nlp 생성
        // '.'을 기준으로 문장 나눠서 배열로 저장
        const textArray = text.split('.');
        // 마지막 배열 요소는 빈 문자열이므로 빼고 생각하기 위한 처리     
        let count;
        if(textArray.length == 1){
            count = textArray.length;
        }else{
            count = textArray.length - 1;
        }
        for(let i = 0; i < count; i++){ //문장개수만큼 돌리기
            const sentence = textArray[i].trim() +'.';
            const paraphrasing = await speakingRepository.paraphrasing(sentence);
            const formality = await speakingRepository.formality(sentence);
            await speakingRepository.createNlp(speakingId, sentence, paraphrasing, formality);
        }

        const nlp = await speakingRepository.getAllNLP(speakingId);      

        //wordFrequency DB에 저장
        const wordFrequency = await speakingRepository.wordFrequency(text); 
        let wordFrequencyDB;
        //단어 5개 미만 사용하면 wordFrequency API가 null값 리턴해줌 
        if(wordFrequency != null){ 
            for(let i=0; i < wordFrequency.length; i++){
                const word = wordFrequency[i].word;
                const count = wordFrequency[i].count;
                await speakingRepository.createWordFrequency(speakingId, word, count);
            }
            wordFrequencyDB = await speakingRepository.getAllWord(speakingId);
        }
        else{
            wordFrequencyDB = null;
        }
        
    
        //speaking Table에서 speaking정보 가져오기
        const speaking = await speakingRepository.getById(speakingId);


        res.status(201).json({
            isSuccess: true,
            code: 201, 
            message:'스피킹이 성공적으로 생성되었습니다.', 
            result:{
                userId: speaking.userId,
                speakingId: speaking.id,
                categoryId: speaking.categoryId,
                categoryName: speaking.categoryName,
                speakingUuid: speaking.speakingUuid,
                title: speaking.title,
                saveDate: speaking.saveDate,
                url: speaking.url,
                time: speaking.recordTime,
                text: speaking.beforeText,
                correctedText: speaking.correctedText,
                pronunciation: speaking.pronunciation,
                speed: speaking.speed,
                nlp: nlp,
                wordFrequency: wordFrequencyDB,
                selectedformality: speaking.selectedformality,
            }
        });
    }
    catch{ 
        //GPT 가끔 요청 에러 발생. 만약 에러 발생하면 correctedText에 원본 text를 넣어서 저장
        const speakingId = await speakingRepository.create(userId, categoryId, categoryName, speakingUuid, title, saveDate, text, text, url, time, pronunciation, speed, selectedformality);
        
        //nlp 생성
        // '.'을 기준으로 문장 나눠서 배열로 저장
        const textArray = text.split('.');
        // 마지막 배열 요소는 빈 문자열이므로 빼고 생각하기 위한 처리     
        let count;
        if(textArray.length == 1){
            count = textArray.length;
        }else{
            count = textArray.length - 1;
        }
        for(let i = 0; i < count; i++){ //문장개수만큼 돌리기
            const sentence = textArray[i].trim() +'.';
            const paraphrasing = await speakingRepository.paraphrasing(sentence);
            const formality = await speakingRepository.formality(sentence);
            await speakingRepository.createNlp(speakingId, sentence, paraphrasing, formality);
        }

        const nlp = await speakingRepository.getAllNLP(speakingId);      

        //wordFrequency DB에 저장
        const wordFrequency = await speakingRepository.wordFrequency(text); 

        for(let i=0; i < wordFrequency.length; i++){
            const word = wordFrequency[i].word;
            const count = wordFrequency[i].count;
            await speakingRepository.createWordFrequency(speakingId, word, count);
        }
        const wordFrequencyDB = await speakingRepository.getAllWord(speakingId);
        
        

        //speaking Table에서 speaking정보 가져오기
        const speaking = await speakingRepository.getById(speakingId);


        res.status(500).json({
            isSuccess: false,
            code: 500, 
            message:'노드 외부 API 호출 실패', 
            result:{
                userId: speaking.userId,
                speakingId: speaking.id,
                categoryId: speaking.categoryId,
                categoryName: speaking.categoryName,
                speakingUuid: speaking.speakingUuid,
                title: speaking.title,
                saveDate: speaking.saveDate,
                url: speaking.url,
                time: speaking.recordTime,
                text: speaking.beforeText,
                correctedText: speaking.correctedText,
                pronunciation: speaking.pronunciation,
                speed: speaking.speed,
                nlp: nlp,
                wordFrequency: wordFrequencyDB,
                selectedformality: speaking.selectedformality,
            }
        });
    }
};

// 카테고리 아이디 입력받으면, 해당 카테고리에 해당하는 스피킹 목록 반환
// 스피킹 이름 입력 받으면, 검색해서 반환 (userId 고려)
// 카테고리 아이디랑 스피킹 이름 입력 없으면, userId에 해당하는 스피킹 반환
export async function getSpeaking(req,res){
    const userId = req.userId;
    const categoryId = req.query.categoryId;
    const title = req.query.title;
    
    let speakings;

    if(title && categoryId){ 
        speakings = await speakingRepository.getByTitle(userId,categoryId,title);
    } else if (title){ //제목 검색 후 나오는 목록
        speakings = await speakingRepository.getAllByTitle(userId,title);
    } else if (categoryId){ //카테고리에 해당하는 목록
        speakings = await speakingRepository.getAllByCategory(categoryId);
    } else { //전체 목록 
        speakings = await speakingRepository.getAllByUserId(userId);
    }
    
    res.status(200).json({
        isSuccess: true,
        code: 200, 
        message:'스피킹 목록을 성공적으로 불러왔습니다.', 
        result: speakings
        }
    );
};



//스피킹 상세 조회 
export async function getSpeakingById(req,res){
    const speakingId = req.params.id;
    const speaking = await speakingRepository.getById(speakingId);
    const nlp = await speakingRepository.getAllNLP(speakingId);
    const wordFrequency = await speakingRepository.getAllWord(speakingId);


    if(!speaking){ //잘못된 아이디 집어넣어서 스피킹이 존재하지 않으면
        return res.status(404).json({
            isSuccess: false,
            code: 404, 
            message:'해당 스피킹은 존재하지 않습니다.', 
        });
    }
    

    let wordFrequencyDB;
    if(wordFrequency.length === 0){
        wordFrequencyDB = null;
    }
    else{
        wordFrequencyDB = wordFrequency;
    }

    res.status(200).json({
        isSuccess: true,
        code: 200, 
        message:'스피킹 상세정보를 성공적으로 불러왔습니다.', 
        result: {
            userId: speaking.userId,
            speakingId: speaking.id,
            categoryId: speaking.categoryId,
            categoryName: speaking.categoryName,
            speakingUuid: speaking.speakingUuid,
            title: speaking.title,
            saveDate: speaking.saveDate,
            url: speaking.url,
            time: speaking.recordTime,
            text: speaking.beforeText,
            correctedText: speaking.correctedText,
            pronunciation: speaking.pronunciation,
            speed: speaking.speed,
            nlp: nlp,
            wordFrequency: wordFrequencyDB,
            selectedformality: speaking.selectedformality,
        }
    });
}




//스피킹 삭제
export async function deleteSpeaking(req,res){
    const speakingId = req.params.id;
    const speaking = await speakingRepository.getById(speakingId);
    if(!speaking){ //잘못된 아이디 집어넣어서 스피킹이 존재하지 않으면
        return res.status(404).json({
            isSuccess: false,
            code: 404, 
            message:'해당 스피킹은 존재하지 않습니다.', 
        });
    }
    if(speaking.userId !== req.userId){
        return res.status(403).json({
            isSuccess: false,
            code: 403, 
            message:'스피킹을 삭제할 권한이 없습니다.', 
        });
    }
    await speakingRepository.removeNlp(speakingId);
    await speakingRepository.removeWordFrequency(speakingId);
    await speakingRepository.removeSpeaking(speakingId);
    res.status(200).json({isSuccess: true,
        code: 200, 
        message:'선택한 스피킹이 성공적으로 삭제되었습니다.',});
}

export async function testGpt(req, res){
    const text = req.body.text;

    const correctedText = await speakingRepository.chatGPT(text);

    res.status(200).json({
        text: text,
        correctedText: correctedText
    })
}