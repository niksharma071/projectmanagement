import express, { urlencoded } from "express"
const app = express()
import cors from "cors"
import healthcheckroute from "./routes/healthcheck_route.js"
import userrouteer from "./routes/user_route.js"
import cookieParser from "cookie-parser"
import projectRouter from "./routes/projectRoute.js"
import taskRouter from "./routes/taskRoute.js";
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())

app.use(cors({
    origin: process.env.cors_origin || "http:/localhost:5173",
    credentials:true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"]

}))

app.use("/api/v1/healthcheck",healthcheckroute)
app.use("/api/v1/auth",userrouteer)
app.use("/api/v1/projects/",projectRouter)
app.use("/api/v1/projects/task", taskRouter)

app.get("/",(req,res)=>{
    res.send("hii")
})


export default app;