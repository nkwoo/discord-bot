import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";

export interface Corona {
    getCoronaState(channel: TextChannel | DMChannel | GroupDMChannel): void;
}