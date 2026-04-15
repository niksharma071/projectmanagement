import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./db/index.js";
dotenv.config({
    path: "./.env"
})

const port = process.env.port
connectDB().then(()=>{
    app.listen(port,()=>{
    console.log(`listining to port ${process.env.port}`);
    })
})
.catch((err)=>{
    console.error("db coonection failed", err)
    process.exit(1)
})

