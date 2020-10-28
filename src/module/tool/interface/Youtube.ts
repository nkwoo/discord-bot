import {DMChannel, GroupDMChannel, Message, StreamDispatcher, TextChannel} from "discord.js";
import {DiscordServer} from "../../discord/DiscordServer";
import {YoutubeVideo} from "../../discord/YoutubeVideo";

export interface YouTube {
    addYoutube(message: Message, server: DiscordServer, videoUrl: string): void;
    setYoutubeVolumeControl(channel: TextChannel | DMChannel | GroupDMChannel, musicPlayer: StreamDispatcher | null, option: string): void;
    pauseYoutubePlayer(channel: TextChannel | DMChannel | GroupDMChannel, musicPlayer: StreamDispatcher | null): void;
    skipYoutubeVideo(musicPlayer: StreamDispatcher | null): void;
    getPlayList(channel: TextChannel | DMChannel | GroupDMChannel, list: YoutubeVideo[]): void;
    stopPlayer(message: Message): void;
}

