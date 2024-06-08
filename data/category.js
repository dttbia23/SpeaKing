import { db } from '../db/database.js';

export async function getById(id){
    return db
    .execute( 'SELECT * FROM category WHERE id=?', [id])
    .then((result) => result[0][0]);
}

export async function create(name, userId){
    return db.execute('INSERT INTO category (name, userId) VALUES(?,?)',
    [name, userId])
    .then((result) => getById(result[0].insertId));
}


export async function getAll(userId){
    return db
    .execute('SELECT id as categoryId, name, userId FROM category WHERE userId=?', [userId])
    .then((result)=>result[0]);
}

export async function update(id, name){
    return db.execute('UPDATE category SET name=? WHERE id=?', [name, id])
    .then(()=>getById(id));
}

export async function removeCategory(id){
    return db.execute('DELETE FROM category WHERE id =?', [id]);
}