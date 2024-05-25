// require('dotenv').config({path: "./env"});
import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import { app } from './app.js';




dotenv.config({
    path: './env'
})







connectDB().then(()=>{
    
    app.post("/jokes", (req, res)=>{
        res.send("kiran is good boy")
    })
    


    app.listen(process.env.PORT , ()=>{
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

