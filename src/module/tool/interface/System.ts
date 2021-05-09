import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";
import {ResultVo} from "../SystemImpl";

export interface System {
    getSystemState(channel: TextChannel | DMChannel | GroupDMChannel): Promise<void>;
    linuxGetCpuGpuTemperature(): Promise<ResultVo>;
}