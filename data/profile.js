import { db } from '../db/database.js';

export async function findById(id) {
    return db.execute('SELECT * FROM user WHERE id=?', [id])
    .then((result)=>result[0][0]);
}

export async function update(id, nickname, intro, url){
    return db.execute('UPDATE user SET nickname=?, intro=?, url=? WHERE id=?', [nickname, intro, url, id])
    .then(()=>findById(id));
}