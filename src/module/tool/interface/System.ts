import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";

export interface System {
    getSystemState(channel: TextChannel | DMChannel | GroupDMChannel): void;
    linuxGetCpuGpuTemperature(): any;
}