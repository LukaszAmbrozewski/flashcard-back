import {RegUserEntity} from "../types";
import {pool} from "../utils/db";

const {v4: uuid} = require('uuid');

export class UserRecord implements RegUserEntity {
    id?: string;
    name: string;
    email: string;
    hashedPassword: string;

    constructor(obj: RegUserEntity) {
        this.id = obj.id;
        this.name = obj.name;
        this.email = obj.email;
        this.hashedPassword = obj.hashedPassword;
    }

    static async addFlashcard(name: string, email: string, hashedPassword: string) {
        await pool.execute("INSERT INTO `users` VALUES (:id, :name, :email, :hashedPassword);", {
            id: uuid(),
            name: name,
            email: email,
            hashedPassword: hashedPassword,
        })
    }

    static async getOneForId(id: string) {
        const [result] = await pool.execute("SELECT * FROM `users` WHERE `id`=:id", {
            id: id,
        })
        return result;
    }

    static async getOneForEmail(email: string) {
        const [result] = await pool.execute("SELECT * FROM `users` WHERE `email`=:email", {
            email: email,
        })
        return result;
    }
}