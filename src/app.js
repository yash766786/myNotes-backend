import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,  // Frontend origin
    credentials: true,                // Allow cookies and credentials
}))
app.use(cookieParser())

app.use(express.json())

//routes import
import userRouter from "./routes/user.routes.js"
import noteRouter from "./routes/note.routes.js"


// routes declaration
app.use('/api/v2/users', userRouter)
app.use('/api/v2/notes', noteRouter)


export default app