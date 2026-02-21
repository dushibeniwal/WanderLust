require('dotenv').config();
const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const MONGO_URL = process.env.MONGO_URL;

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: '69038931014c0d4ecdf5c47a',
  }));
  await Listing.insertMany(initData.data);
  console.log('data is initialised');
};

main()
  .then(async () => {
    console.log('connection with db');
    await initDB(); // ✅ ensures DB ready
  })
  .catch((err) => {
    console.log(err);
  });
