import {DMChannel, NewsChannel, TextChannel} from "discord.js";

export interface Weather {
    getSeoulWeather(channel: TextChannel | DMChannel | NewsChannel): void;
}