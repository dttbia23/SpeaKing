import {db} from '../db/database.js'

// 사용자 이메일로 찾기
export async function findByEmail(email) { 
    return db.execute('SELECT * FROM user WHERE email=?', [email])
    .then((result)=>result[0][0]);
}

export async function findById(id) {
    return db.execute('SELECT * FROM user WHERE id=?', [id])
    .then((result)=>result[0][0]);
}

export async function createUser(user) {
    const {email, password, nickname, intro, url} = user;
    return db.execute('INSERT INTO user(email, password, nickname, intro, url) VALUES (?,?,?,?,?)',
    [email, password, nickname, intro, url])
    .then((result)=> result[0].insertId);
}

export async function removeUser(id){
    return db.execute('DELETE FROM user WHERE id=?', [id]);
}
