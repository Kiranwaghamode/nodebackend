// require('dotenv').config({path: "./env"});
import dotenv from 'dotenv';
import express from 'express'
import connectDB from "./db/index.js";



dotenv.config({
    path: './env'
})





const app = express();


connectDB().then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`server is running at port : ${process.env.PORT}`);
    })
})








/*
;(async()=>{

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("ERROR", (error)=>{
            console.log("express Error", error)
        })
        app.listen(process.env.PORT, ()=>{
            console.log("app listening on ", process.env.PORT)
        })


    } catch (error) {
        console.log("ERROR", error)
    }


})()

*/

