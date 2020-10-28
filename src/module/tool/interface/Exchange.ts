import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";

export interface Exchange {
    getExchangeWonToJpy(channel: TextChannel | DMChannel | GroupDMChannel): void;
}