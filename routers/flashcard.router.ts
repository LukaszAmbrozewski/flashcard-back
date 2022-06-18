import {Router} from "express";
import {FlashcardRecord} from "../records/flashcard.record";


export const flashcardRouter = Router()

    .get('/list', async (req, res) => {

        const list = await FlashcardRecord.findAllForUser('58b03369-ed61-11ec-a0e7-1c666d8b4151');
        res.json(list)
    })


    .get('/:id', async (req, res) => {

        const oneFlashcard = await FlashcardRecord.getOneForUser("58b03369-ed61-11ec-a0e7-1c666d8b4151", req.params.id);
        console.log(oneFlashcard)
        res.json(oneFlashcard)
    })


    .delete('/:id', async (req, res) => {

        await FlashcardRecord.removeFlashcard(req.params.id);

    })

;