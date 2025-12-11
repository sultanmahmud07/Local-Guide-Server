import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import expressSession from "express-session";
import passport from "passport";
import { envVars } from "./app/config/env";
import "./app/config/passport";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";

const app = express()


app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use(express.json())
app.set("trust proxy", 1)
app.use(cors({
    origin: ["http://localhost:3000", "https://local-guide-client-fz9u.vercel.app"],
    // methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true, 
  }))

app.use("/api/v1", router)

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Tour Guide API"
    })
})


app.use(globalErrorHandler)

app.use(notFound)

export default app