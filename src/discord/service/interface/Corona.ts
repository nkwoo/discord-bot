import {DMChannel, NewsChannel, TextChannel} from "discord.js";

export interface Corona {
    getCoronaState(channel: TextChannel | DMChannel | NewsChannel): void;
}