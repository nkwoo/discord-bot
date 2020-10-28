import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";

export interface Weather {
    getSeoulWeather(channel: TextChannel | DMChannel | GroupDMChannel): void;
}