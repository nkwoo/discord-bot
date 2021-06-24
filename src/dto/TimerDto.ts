import {CommonDto} from "./CommonDto";
import {Member} from "../module/discord/Member";

export class TimerDto extends CommonDto {
    private _channel: string;
    private _endTime: number;
    private _caller: Member;
    private _calledMembers: Member[];
    private _rank: number;

    constructor(channel: string, endTime: number, caller: Member, calledMembers: Member[], rank: number, message: string) {
        super(true);
        this._channel = channel;
        this._endTime = endTime;
        this._caller = caller;
        this._calledMembers = calledMembers;
        this._rank = rank;
        this.message = message;
    }

    get channel(): string {
        return this._channel;
    }

    set channel(value: string) {
        this._channel = value;
    }

    get endTime(): number {
        return this._endTime;
    }

    set endTime(value: number) {
        this._endTime = value;
    }

    get caller(): Member {
        return this._caller;
    }

    set caller(value: Member) {
        this._caller = value;
    }

    get calledMembers(): Member[] {
        return this._calledMembers;
    }

    set calledMembers(value: Member[]) {
        this._calledMembers = value;
    }

    get rank(): number {
        return this._rank;
    }

    set rank(value: number) {
        this._rank = value;
    }
}