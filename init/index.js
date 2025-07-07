const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/WANDERLUST');
}
main().then(() => {
    console.log("Connected to WANDERLUST database");
})
.catch(err => console.log(err));
const initDB = async () => {
    await Listing.deleteMany({});
   initData.data= initData.data.map((obj)=>({...obj,owner:"68622b950ead2dbecd42807d"}));
    await Listing.insertMany(initData.data);
    console.log("Database initialized with sample data");
}
initDB();
