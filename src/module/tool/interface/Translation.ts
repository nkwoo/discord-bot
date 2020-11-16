import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";

export interface Translation {
    translationLang(channel: TextChannel | DMChannel | GroupDMChannel, content: string, target: string): void;
    getTranslationCode(channel: TextChannel | DMChannel | GroupDMChannel): void;
    checkSpellMessage(channel: TextChannel | DMChannel | GroupDMChannel, content: string): void;
}