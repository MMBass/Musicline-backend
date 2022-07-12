const { MongoClient, ObjectId } = require('mongodb');
const dev_config = (process.env.store === undefined) ? require('../config/devConfig') : undefined;

const client = new MongoClient('DBUrl'); // todo replace names
const collection = client.db("DBname").collection("CollectionName"); // todo replace names

async function readAll() {
    await client.connect();
    let all = await collection.find().toArray();
    client.close();
    return all;
};

async function read(name) {
    await client.connect();
    let all = await collection.find({"user": name}).toArray();
    client.close();
    return all;
};

async function createOne(details) {
    await client.connect();
    await collection.insertOne(details);
    client.close();
    return true;
};

async function putOne(id,newvalues = {}) {
    await client.connect();
    await collection.updateOne({_id:ObjectId(id)},{ $set: newvalues })
    client.close();
    return true;
};

async function removeOne(id) {
    await client.connect();
    await collection.deleteOne({_id:ObjectId(id)});
    client.close();
    return true;
};

module.exports = {readAll,read,createOne,putOne, removeOne};