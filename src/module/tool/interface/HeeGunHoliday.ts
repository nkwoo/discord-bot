import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";

export interface HeeGunHoliday {
    checkHeeKunHoliday(channel: TextChannel | DMChannel | GroupDMChannel, parameter: string): void;
}