import {DMChannel, NewsChannel, TextChannel} from "discord.js";

export interface Exchange {
    getExchangeWonToJpy(channel: TextChannel | DMChannel | NewsChannel): void;
}