'use strict';

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'crud_products_db';

const client = new MongoClient(uri);
let db = null;

async function connect() {
    if (!db) {
        await client.connect();
        db = client.db(dbName);
        console.log(` Connected to MongoDB: ${dbName}`);
    }
    return db;
}

function getDb() {
    if (!db) {
        throw new Error('Database chưa được khởi tạo. Hãy gọi connect() trước.');
    }
    return db;
}

async function close() {
    if (client) {
        await client.close();
        db = null;
        console.log(' MongoDB connection closed.');
    }
}

module.exports = {
    connect,
    getDb,
    close
};