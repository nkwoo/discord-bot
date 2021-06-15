import {DMChannel, NewsChannel, TextChannel} from "discord.js";

export interface Translation {
    translationLang(channel: TextChannel | DMChannel | NewsChannel, content: string, target: string): void;
    getTranslationCode(channel: TextChannel | DMChannel | NewsChannel): void;
    checkSpellMessage(channel: TextChannel | DMChannel | NewsChannel, content: string): void;
}