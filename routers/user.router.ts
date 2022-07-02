import {Router} from "express";


export const userRouter = Router()

    .post('/registration', async (req) => {

        console.log(req.body)
    })

    .post('/login', async (req) => {

        console.log(req.body)
    })

;