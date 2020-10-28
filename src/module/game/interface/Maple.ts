import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";

export interface Maple {
    searchMaplePlayerData(channel: TextChannel | DMChannel | GroupDMChannel, nickName: string, type: number): void;
}