import cors from "cors";
import express, {json, NextFunction, Request, Response, Router} from "express";

import {config} from "./config/config";
import rateLimit from "express-rate-limit";
import {flashcardRouter} from "./routers/flashcard.router";
import {userRouter} from "./routers/user.router";
import mongoose from "mongoose";
import passport from 'passport';
import passportLocal from 'passport-local';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import User from './utils/User'
import dotenv from 'dotenv';
import {DatabaseUserInterface, UserInterface} from "./types";


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
            if (err) {
                console.log(err)
                console.log('Nie znaleziono użytkownika o takiej nazwie')
                throw err;
            }

            if (!user) return done(null, false);
            bcrypt.compare(password, user.password, (err, result: boolean) => {
                if (err) {
                    console.log(err)
                    console.log('Niepoprawne hasło')
                    throw err;
                }

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
    max: 200,
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
router.use('/user/', userRouter);

app.use('/api/', router)


router.post('/register', async (req, res) => {
    const {username, password} = req?.body;
    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
        res.send("Success");
        return;
    }

    User.findOne({username}, async (err: Error, doc: DatabaseUserInterface) => {
        if (err) throw err;
        if (doc) res.send("User Already Exists");   //Sprawdza czy użytkownik o takiej nazwie istnieje
        if (!doc) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username: username,
                password: hashedPassword,
            });   //stworzono obiekt nowego użytkownika
            await newUser.save();
            res.send("Success")    //po zapisie wysłana odpowiedź ze success
            console.log('Zarejestrowano nowego użytkownika')
        }
    })
});

export const isAdministratorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const {user}: any = req;
    console.log(user)

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

router.post("/login", passport.authenticate('local'), (req, res) => {
    res.send('success');
});

router.get('/user', (req, res) => {
    res.send(req.user);
});

router.get('/logout', (req, res) => {
    //Rozwiązanie z innej strony z funkcją zwrotną która ma się uruchomić po wykonaniu
    req.logOut(function () {
        console.log('Done logging out.');
    });
    res.send('success')
})


router.post("/deleteuser", isAdministratorMiddleware, async (req, res) => {
    const {id} = req.body;
    User.findByIdAndDelete(id, (err: Error) => {
        if (err) throw err;
    });
    res.send("success");
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

//!!TODO Zmnieniony port na localhost
app.listen(3001, 'localhost', () => {
    console.log('Listening on 0.0.0.0:3001');
});