import {Message} from "discord.js";
import {TimeQueue} from "../../discord/TimeQueue";

export interface Timer {
    addTimer(message: Message, timerQueue: TimeQueue[], callUser: string, hour: number): void;
    removeTimer(message: Message, timerQueue: TimeQueue[], inputRank: number): void;
    timerList(message: Message, timerQueue: TimeQueue[]): void;
}