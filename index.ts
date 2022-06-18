import cors from "cors";
import express, {json, Router} from "express";
import {config} from "./config/config";
import rateLimit from "express-rate-limit";
import {flashcardRouter} from "./routers/flashcard.router";
import {userRouter} from "./routers/user.router";


const app = express();

app.use(cors({
        origin: config.corsOrigin
    }
));

app.use(json());
app.use(rateLimit({
    windowMs: 5 * 60 * 100,
    max: 200,
}));

const router = Router();
router.use('/flashcard/', flashcardRouter);
router.use('/user/', userRouter);

app.use('/api', router)


app.listen(3001, 'localhost', () => {
    console.log('Listening on http://localhost:3001')
});