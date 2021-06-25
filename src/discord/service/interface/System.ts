import {DMChannel, NewsChannel, TextChannel} from "discord.js";
import {ResultVo} from "../SystemImpl";

export interface System {
    getSystemState(channel: TextChannel | DMChannel | NewsChannel): Promise<void>;
    linuxGetCpuGpuTemperature(): Promise<ResultVo>;
}