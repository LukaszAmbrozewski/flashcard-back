import {Router} from "express";
import {FlashcardRecord} from "../records/flashcard.record";

export const flashcardRouter = Router()

    .get('/list', async (req, res) => {

        const {user}: any = req
        const userObj: any = JSON.stringify(user);

        const ar = [];
        for (let key in user) {
            ar.push(user[key])
        }
        const userId = userObj ? (ar[2]).toString() : null;
        const data = await FlashcardRecord.findAllForUser(userId);

        res.json(data)
    })

    .get('/one', async (req, res) => {

        const {user}: any = req
        const userObj: any = JSON.stringify(user);

        const ar = [];
        for (let key in user) {
            ar.push(user[key])
        }

        const userId = userObj ? (ar[2]).toString() : null;
        const data = await FlashcardRecord.findOneRandomForUser(userId);
        res.json(data)
    })

    .post('/add', async (req, res) => {
        if (req.body) {
            const {front, back, category, userId} = req.body
            await FlashcardRecord.addFlashcard(front, back, category, userId)
            res.json('success')
        }
    })


// .get('/:id', async (req, res) => {
//
//     const oneFlashcard = await FlashcardRecord.getOneForUser("58b03369-ed61-11ec-a0e7-1c666d8b4151", req.params.id);
//     console.log(oneFlashcard)
//     res.json(oneFlashcard)
// })
//
//

//     .delete('/:id', async (req, res) => {
//
//         console.log(req.params.id);
//         await FlashcardRecord.removeFlashcard(req.params.id);
//
//     })
// ;