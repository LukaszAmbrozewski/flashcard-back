import cors from "cors";
import express, {json} from "express";
import {config} from "./config/config";
import rateLimit from "express-rate-limit";


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

app.get('/', (req, res) => {
    res.send('Test');
})


app.listen(3001, 'localhost', () => {
    console.log('Listening on http://localhost:3001')
});