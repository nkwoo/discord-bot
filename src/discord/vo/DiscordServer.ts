import {StreamDispatcher} from "discord.js";
import {YoutubeVideo} from "./YoutubeVideo";
import {Member} from "./Member";
import {CallTimer} from "./CallTimer";

export class DiscordServer {
    private _id: string;
    private _name: string;
    private _youtubePlayList: YoutubeVideo[] = [];
    private _youtubePlayer: StreamDispatcher;
    private _memberList: Member[];
    private _timerList: CallTimer[] = [];

    constructor(id: string, name: string, memberList: Member[]) {
        this._id = id;
        this._name = name;
        this._memberList = memberList;
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

    get youtubePlayList(): YoutubeVideo[] {
        return this._youtubePlayList;
    }

    set youtubePlayList(value: YoutubeVideo[]) {
        this._youtubePlayList = value;
    }

    get memberList(): Member[] {
        return this._memberList;
    }

    set memberList(value: Member[]) {
        this._memberList = value;
    }

    get youtubePlayer(): StreamDispatcher {
        return this._youtubePlayer;
    }

    set youtubePlayer(value: StreamDispatcher) {
        this._youtubePlayer = value;
    }

    get timerList(): CallTimer[] {
        return this._timerList;
    }

    set timerList(value: CallTimer[]) {
        this._timerList = value;
    }
}