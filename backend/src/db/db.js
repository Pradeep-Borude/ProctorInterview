const mongoose = require('mongoose');



function connectDB(){
    mongoose.connect(  process.env.MONGODB_URL)
    .then(()=>{
        console.log("mongoDB connected");
    })
    .catch((err)=>{
        console.error("mongoDB connection error", err);
    });
}

module.exports = connectDB;