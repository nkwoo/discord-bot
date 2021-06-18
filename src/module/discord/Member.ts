import {GuildMember, Snowflake} from "discord.js";

export class Member {
    private _id: string;
    private _name: string;

    constructor(id: Snowflake, member: GuildMember) {
        this.id = id;
        this.name = member.nickname ? member.nickname : member.displayName;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }
}