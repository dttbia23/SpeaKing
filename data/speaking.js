import { Configuration, OpenAIApi } from 'openai';
import { config } from '../config.js';
import { db } from '../db/database.js';
import axios from 'axios';

export async function getById(id){
    return db
    .execute( 'SELECT * FROM speaking WHERE id=?', [id])
    .then((result) => result[0][0]);
}

//speaking 만들고 speaking id 반환
export async function create(userId, categoryId, categoryName, speakingUuid, title, saveDate, text, correctedText, url, time, pronunciation, speed, selectedformality){
    return db.execute('INSERT INTO speaking (userId, categoryId, categoryName, speakingUuid, title, saveDate, beforeText, correctedText, url, recordTime, pronunciation, speed, selectedformality) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [userId, categoryId, categoryName, speakingUuid, title, saveDate, text, correctedText, url, time, pronunciation, speed, selectedformality])
    .then((result) => result[0].insertId);
}

export async function getAllByUserId(userId){
    return db.execute('SELECT categoryId, categoryName, id as speakingId, title, saveDate, recordTime, speakingUuid, selectedformality FROM speaking WHERE userId=?', [userId])
    .then((result) => result[0]);
}

export async function getAllByCategory(categoryId){
    return db.execute('SELECT categoryId, categoryName, id as speakingId, title, saveDate, recordTime, speakingUuid, selectedformality FROM speaking WHERE categoryId=?', [categoryId])
    .then((result) => result[0]);
}

export async function getAllByTitle(userId,title){
    const searchTitle = `%${title}%`
    return db.execute('SELECT categoryId, categoryName, id as speakingId, title, saveDate, recordTime, speakingUuid, selectedformality FROM speaking WHERE userId=? and title LIKE ?', [userId,searchTitle])
    .then((result) => result[0]);
}

export async function getByTitle(userId,categoryId, title){
    const searchTitle = `%${title}%`
    return db.execute('SELECT categoryId, categoryName, id as speakingId, title, saveDate, recordTime, speakingUuid, selectedformality FROM speaking WHERE userId=? and categoryId=? and  title LIKE ?', [userId,categoryId,searchTitle])
    .then((result) => result[0]);
}


export async function removeNlp(speakingId){
    return db.execute('DELETE FROM nlp WHERE speakingId =?', [speakingId]);
}
export async function removeWordFrequency(speakingId){
    return db.execute('DELETE FROM wordFrequency WHERE speakingId =?', [speakingId]);
}
export async function removeSpeaking(speakingId){
    return db.execute('DELETE FROM speaking WHERE id =?', [speakingId]);
}





//createNlp
export async function createNlp(speakingId, sentence, paraphrasing, formality){
    return db
    .execute('INSERT INTO nlp (sentence, formality, paraphrasing, speakingId) VALUES (?,?,?,?)',
    [sentence, formality, paraphrasing, speakingId]);
}

//get all NLP
export async function getAllNLP(speakingId){
    return db
    .execute('SELECT id as nlpId, sentence, paraphrasing, formality FROM nlp WHERE speakingId = ?', [speakingId])
    .then((result)=>result[0]);
}

//createWordFrequency
export async function createWordFrequency(speakingId, word, count){
    return db
    .execute('INSERT INTO wordFrequency (word, count, speakingId) VALUES (?,?,?)',
    [word, count, speakingId]);
}

//get all Word Frequency use speaking Id
export async function getAllWord(speakingId){
    return db
    .execute('SELECT id as wordId, word, count FROM wordFrequency WHERE speakingId = ?', [speakingId])
    .then((result)=>result[0]);
}




//GPT 호출하는 코드
export async function chatGPT(prompt){
    const configuration = new Configuration({
        apiKey: config.gpt.openAIKey,
    });
    const openai = new OpenAIApi(configuration);
    const condition = 
    `Correct these to standard English. Just give me only corrected sentences.
    `


    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${condition} / text: '${prompt}'`,
        temperature: 0,
        max_tokens: 300,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    });

    return response.data.choices[0].text.trim();
}


//단어 빈도수 API 호출
export async function wordFrequency(text){    
    const response = await axios
    .post('http://3.36.55.248:5001/frequency', JSON.stringify({data:text}),
    {headers: {
        "Content-Type": `application/json`,
    }});

    const result = response.data;

    return result;
}

//문장변환 API 호출
export async function paraphrasing(text){
    const response = await axios
    .post('http://3.36.146.93:5000/paraphrasing', JSON.stringify({data:text}),
    {headers: {
        "Content-Type": `application/json`,
    }});

    const result = response.data;

    return result.text;
}    

//형식성 API 호출
export async function formality(text){
    const response = await axios
    .post('http://3.36.55.248:5002/formality', JSON.stringify({data:text}),
    {headers: {
        "Content-Type": `application/json`,
    }});

    const result = response.data;
    return result.formality;
}    