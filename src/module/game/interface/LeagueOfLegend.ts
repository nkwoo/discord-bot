import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";

export interface LeagueOfLegend {
    searchLoLPlayData(channel: TextChannel | DMChannel | GroupDMChannel, nickname: string): void;
    getRotationsChampion(channel: TextChannel | DMChannel | GroupDMChannel): void;
}