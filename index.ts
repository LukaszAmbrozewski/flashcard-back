import cors from "cors";
import express, {json, NextFunction, Request, Response, Router} from "express";
import {config} from "./config/config";
import {flashcardRouter} from "./routers/flashcard.router";
// import {userRouter} from "./routers/user.router";
import mongoose from "mongoose";
import passport from 'passport';
import passportLocal from 'passport-local';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import User from './utils/User'
import dotenv from 'dotenv';
import {DatabaseUserInterface, UserInterface} from "./types";
import rateLimit from "express-rate-limit";


const LocalStrategy = passportLocal.Strategy;
dotenv.config();


mongoose.connect(`${process.env.PART1STRING}${process.env.MYUSERNAME}:${process.env.PASSWORD}${process.env.PART2STRING}`, (err: Error) => {
    if (err) throw err;
    console.log("Connected to Mongo")
});

const app = express();

app.use(express.json());
app.use(cors({origin: config.corsOrigin, credentials: true}));
app.use(
    session({
        secret: "secretcode",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy((username: string, password: string, done) => {
        User.findOne({username: username}, (err: Error, user: DatabaseUserInterface) => {
            if (err) throw err;
            if (!user) return done(null, false);
            bcrypt.compare(password, user.password, (err, result: boolean) => {
                if (err) throw err;
                if (result) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        });
    })
);

app.use(json());

app.use(rateLimit({
    windowMs: 5 * 60 * 100,
    max: 500,
}));

passport.serializeUser((user: DatabaseUserInterface, cb) => {
    cb(null, user._id);
});

passport.deserializeUser((id: string, cb) => {
    User.findOne({_id: id}, (err: Error, user: DatabaseUserInterface) => {
        const userInformation: UserInterface = {
            username: user.username,
            isAdmin: user.isAdmin,
            id: user._id
        };
        cb(err, userInformation);
    });
});


const router = Router();
router.use('/flashcard/', flashcardRouter);

app.use('/api/', router)


router.post('/register', async (req, res) => {
    const {username, password} = req?.body;
    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
        res.send("Improper Values");
        return;
    }

    User.findOne({username}, async (err: Error, doc: DatabaseUserInterface) => {
        if (err) throw err;
        if (doc) res.send("User Already Exists");
        if (!doc) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username,
                password: hashedPassword,
            });
            await newUser.save();
            res.send("success")
        }
    })
});

export const isAdministratorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const {user}: any = req;

    if (user) {
        User.findOne({username: user.username}, (err: Error, doc: DatabaseUserInterface) => {
            if (err) throw err;
            if (doc?.isAdmin) {
                next();
            } else {
                res.send("Sorry, only admin's can perform this.")
            }
        })
    } else {
        res.send("Sorry, you are logged in.")
    }
}

router.post("/login", passport.authenticate("local"), (req, res) => {
    res.send('success');
});

router.get('/user', (req, res) => {
    res.send(req.user);
});

router.get('/logout', (req, res) => {
    req.logout(function () {
        console.log('Done logging out.');
    });
    res.send('success')
})

router.get('/getallusers', async (req, res) => {
    User.find({}, (err: Error, data: DatabaseUserInterface[]) => {
        if (err) throw err;
        const filteredUsers: UserInterface[] = [];
        data.forEach((item: DatabaseUserInterface) => {
            const userInformation = {
                id: item._id,
                username: item.username,
                isAdmin: item.isAdmin
            }
            filteredUsers.push(userInformation);
        });
        res.send(filteredUsers);
    })
});

app.listen(3001, 'localhost', () => {
    console.log('Listening on 0.0.0.0:3001');
});