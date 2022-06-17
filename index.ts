import cors from "cors";
import express, {json} from "express";
import {config} from "./config/config";
import rateLimit from "express-rate-limit";
import {FlashcardRecord} from './records/flashcard.record'


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

app.get('/', async (req, res) => {
    res.send('Test');
    await FlashcardRecord.addFlashcard('kapusta', 'rrr', 'ss', '58b03369-ed61-11ec-a0e7-1c666d8b4151');
})


app.listen(3001, 'localhost', () => {
    console.log('Listening on http://localhost:3001')
});