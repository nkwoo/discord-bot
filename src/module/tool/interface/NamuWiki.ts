import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";

export interface NamuWiki {
    getNamuRanking(channel: TextChannel | DMChannel | GroupDMChannel): void;
}