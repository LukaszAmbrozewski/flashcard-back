import {Router} from "express";
import {UserRecord} from "../records/user.record";


export const userRouter = Router()


    .get('/test', async (req, res) => {
        const data = await UserRecord.getOneForEmail('Tester1@example.com')
        console.log(data)
    })

    .post('/registration', async (req, res) => {

        console.log(req.body)
    })

    .post('/login', async (req, res) => {

        console.log(req.body)
    })

;