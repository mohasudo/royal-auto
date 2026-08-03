// db.js — MongoDB-backed storage (replaces the old JSON-file version).
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set. Add it to your .env file (local) or environment variables (Render).');
}

const client = new MongoClient(uri);
let dbInstance = null;

async function connect() {
  if (dbInstance) return dbInstance;
  await client.connect();
  dbInstance = client.db('royalauto');
  console.log('Connected to MongoDB');
  return dbInstance;
}

async function getNextId() {
  const database = await connect();
  const counters = database.collection('counters');
  await counters.updateOne({ _id: 'listingId' }, { $inc: { seq: 1 } }, { upsert: true });
  const doc = await counters.findOne({ _id: 'listingId' });
  return doc.seq;
}

async function getAllListings() {
  const database = await connect();
  return database.collection('listings').find({}).sort({ id: -1 }).toArray();
}

async function getListing(id) {
  const database = await connect();
  return database.collection('listings').findOne({ id: Number(id) });
}

async function createListing(listing) {
  const database = await connect();
  const id = await getNextId();
  const newListing = {
    id,
    createdAt: new Date().toISOString(),
    status: 'available',
    ...listing,
  };
  await database.collection('listings').insertOne(newListing);
  return newListing;
}

async function updateListing(id, updates) {
  const database = await connect();
  await database.collection('listings').updateOne({ id: Number(id) }, { $set: updates });
  return database.collection('listings').findOne({ id: Number(id) });
}

async function deleteListing(id) {
  const database = await connect();
  const result = await database.collection('listings').deleteOne({ id: Number(id) });
  return result.deletedCount > 0;
}

module.exports = {
  getAllListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
};