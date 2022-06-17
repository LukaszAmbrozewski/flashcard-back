import {FlashcardEntity} from "../types";
import {pool} from "../utils/db";
import {FieldPacket} from "mysql2";
import {v4 as uuid} from "uuid";

type FlashcardRecordResults = [FlashcardEntity[], FieldPacket[]];

export class FlashcardRecord implements FlashcardEntity {
    id: string;
    front: string;
    back: string;
    category: string;
    status: string;

    constructor(obj: FlashcardEntity) {
    }

    static async getOneForUser(userId: string, flashcardId: string): Promise<FlashcardRecord | null> {
        const [result] = await pool.execute("SELECT * FROM `flashcards` WHERE `status`=:status AND `id`=:id OR `status` = 'public' AND `id`=:id;", {
            status: userId,
            id: flashcardId,
        }) as FlashcardRecordResults;
        return result.length === 0 ? null : new FlashcardRecord(result[0]);
    }

    static async findAllForUser(userId: string): Promise<FlashcardEntity[]> {
        const [result] = await pool.execute("SELECT * FROM `flashcards` WHERE `status`=:status OR `status` = '58b03369-ed61-11ec-a0e7-1c666d8b4151';", {
            status: userId,
        }) as FlashcardRecordResults;
        return result
    }


    static async addFlashcard(front: string, back: string, category: string, status: string) {
        await pool.execute("INSERT INTO `flashcards` VALUES (:id, :front, :back, :category, :status);", {
            id: uuid(),
            front: front,
            back: back,
            category: category,
            status: status,
        })
    }
}