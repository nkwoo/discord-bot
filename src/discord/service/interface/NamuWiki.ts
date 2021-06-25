import {DMChannel, NewsChannel, TextChannel} from "discord.js";

export interface NamuWiki {
    getNamuRanking(channel: TextChannel | DMChannel | NewsChannel): void;
}