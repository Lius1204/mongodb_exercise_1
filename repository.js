'use strict';

const dataSource = require('./mongo-data-source');

function getCollection() {
    return dataSource.getDb().collection('products');
}

function getCountersCollection() {
    return dataSource.getDb().collection('counters');
}

async function getNextId() {
    const result = await getCountersCollection().findOneAndUpdate(
        { _id: 'productId' },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
    );

    const doc = result && result.value ? result.value : result;
    return doc.seq;
}

async function findAll(limit) {
    const collection = getCollection();
    const cursor = collection.find({}, { projection: { _id: 0 } });

    if (limit !== null) {
        cursor.limit(limit);
    }

    return await cursor.toArray();
}

async function findById(productId) {
    const collection = getCollection();
    const product = await collection.findOne(
        { id: productId },
        { projection: { _id: 0 } }
    );

    return product || null;
}

async function create(body) {
    const collection = getCollection();
    const newId = await getNextId();
    const newProduct = { ...body, id: newId };

    await collection.insertOne(newProduct);

    delete newProduct._id;
    return newProduct;
}

async function replace(productId, body) {
    const collection = getCollection();
    const replacedProduct = { ...body, id: productId };

    const result = await collection.findOneAndReplace(
        { id: productId },
        replacedProduct,
        { returnDocument: 'after', projection: { _id: 0 } }
    );

    const doc = result && result.value ? result.value : result;
    return doc || null;
}

async function patch(productId, body) {
    const collection = getCollection();
    const updateData = { ...body };
    delete updateData.id;
    delete updateData._id;

    const result = await collection.findOneAndUpdate(
        { id: productId },
        { $set: updateData },
        { returnDocument: 'after', projection: { _id: 0 } }
    );

    const doc = result && result.value ? result.value : result;
    return doc || null;
}

async function remove(productId) {
    const collection = getCollection();
    const result = await collection.findOneAndDelete(
        { id: productId },
        { projection: { _id: 0 } }
    );

    const doc = result && result.value ? result.value : result;
    return doc || null;
}

module.exports = {
    findAll,
    findById,
    create,
    replace,
    patch,
    remove
};