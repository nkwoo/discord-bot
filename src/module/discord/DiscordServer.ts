import {Queue} from "./Queue";
import {StreamDispatcher} from "discord.js";
import {YoutubeVideo} from "./YoutubeVideo";
import {Member} from "./Member";
import {CallTimerVo} from "./CallTimerVo";

export class DiscordServer {
    private _id: string;
    private _name: string;
    private _musicQueue: Queue<YoutubeVideo>;
    private _musicPlayer: StreamDispatcher | null;
    private _memberList: Member[];
    private _timerList: CallTimerVo[] = [];

    constructor(id: string, name: string, memberList: Member[]) {
        this._id = id;
        this._name = name;
        this._musicQueue = new Queue<YoutubeVideo>();
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

    get musicQueue(): Queue<YoutubeVideo> {
        return this._musicQueue;
    }

    set musicQueue(value: Queue<YoutubeVideo>) {
        this._musicQueue = value;
    }

    get memberList(): Member[] {
        return this._memberList;
    }

    set memberList(value: Member[]) {
        this._memberList = value;
    }

    getMusicPlayer(): StreamDispatcher | null {
        return this._musicPlayer;
    }

    setMusicPlayer(value: StreamDispatcher): void {
        this._musicPlayer = value;
    }

    get timerList(): CallTimerVo[] {
        return this._timerList;
    }

    set timerList(value: CallTimerVo[]) {
        this._timerList = value;
    }
}