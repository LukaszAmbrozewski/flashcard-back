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
        this.id = obj.id;
        this.front = obj.front;
        this.back = obj.back;
        this.category = obj.category;
        this.status = obj.status;
    }


    // static async getOneForUser(userId: string, flashcardId: string): Promise<FlashcardRecord | null> {
    //     const [result] = await pool.execute("SELECT * FROM `flashcards` WHERE `status`=':status' AND `id`=:id OR `status` = 'public' AND `id`=:id;", {
    //         status: userId,
    //         id: flashcardId,
    //     }) as FlashcardRecordResults;
    //     console.log(result[0]);
    //     return result.length === 0 ? null : new FlashcardRecord(result[0]);
    // }

    static async findAllForUser(userId: string): Promise<FlashcardEntity[]> {
        const [result] = await pool.execute("SELECT * FROM `flashcards` WHERE `status`=:status OR `status` = 'public' ORDER BY `front` ASC;", {
            status: userId,
        }) as FlashcardRecordResults;
        return result
    }

    static async findOneForUserByFront(userId: string, front: string): Promise<FlashcardEntity[]> {
        const [result] = await pool.execute("SELECT * FROM `flashcards` WHERE `front` = :front AND `status`= :status OR `status` = 'public' AND `front` = :front;",
            {
                status: userId,
                front: front,
            }) as FlashcardRecordResults;
        return result.length === 0 ? null : result;
    }


    static async findOneRandomForUser(userId: string): Promise<FlashcardEntity[]> {
        const [result] = await pool.execute("SELECT * FROM `flashcards` WHERE `status`=:status OR `status` = 'public' ORDER BY RAND() LIMIT 1;", {
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


    static async removeFlashcard(id: string) {
        await pool.execute('DELETE FROM `flashcards` WHERE `id` = :id;', {
            id: id,
        })
    }
}