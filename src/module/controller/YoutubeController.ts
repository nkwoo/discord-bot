import {GlobalConfig} from "../../config/GlobalConfig";
import Discord, {DMChannel, NewsChannel, StreamDispatcher, TextChannel, VoiceConnection} from "discord.js";
import {DiscordServer} from "../discord/DiscordServer";
import ytdl from "ytdl-core";
import {YoutubeVideo} from "../discord/YoutubeVideo";
import {GlobalController} from "./GlobalController";
import {CallCommand, getYoutubeCommand} from "../discord/command/CallCommand";

export class YoutubeController {

    constructor(private globalConfig: GlobalConfig, private globalController: GlobalController) {
    }

    callCommand(message: Discord.Message, command: CallCommand, args: string[]): void {
        const youtubeCommand = getYoutubeCommand(command);

        if (youtubeCommand != CallCommand.NONE) {
            const server = this.findServer(message);

            if (server == null) {
                message.channel.send("서버 정보를 찾을수 없습니다.");
                return;
            }

            if (!this.hasPermission(message)) {
                message.channel.send("사용할 권한이 없습니다.");
                return;
            }

            switch (youtubeCommand) {
                case CallCommand.YoutubePlayerPlay: {
                    if (args.length < 2) {
                        message.channel.send(`유튜브 주소가 포함되어 있지 않습니다.`);
                        return;
                    }

                    this.addYoutubeQueue(message, server, args[1]);
                    break;
                }
                case CallCommand.YoutubePlayerSound: {
                    if (args.length < 2) {
                        message.channel.send(`${this.globalConfig.discord.prefix}소리 <증가, 감소, 초기화> 형식대로 입력해주세요.`);
                        return;
                    }

                    this.setYoutubeVolumeControl(message, server, args[1]);
                    break;
                }
                case CallCommand.YoutubePlayerPause: {
                    this.pauseYoutubePlayer(message, server.getMusicPlayer());
                    break;
                }
                case CallCommand.YoutubePlayerSkip: {
                    this.skipYoutubeVideo(server.getMusicPlayer());
                    break;
                }
                case CallCommand.YoutubePlayList: {
                    this.getPlayList(message, server.musicQueue.list);
                    break;
                }
                case CallCommand.YoutubePlayerExit: {
                    this.stopPlayer(message, server);
                    break;
                }
            }
        }
    }

    private hasPermission(message: Discord.Message): boolean {
        return this.globalConfig.discord.administratorId.filter(value => message.member ? value === message.member.user.id : false).length > 0;
    }

    private findServer(message: Discord.Message): DiscordServer | null {
        const filterServer = this.globalController.getServerList().filter(value => message.guild ? value.id == message.guild.id : false);
        if (filterServer.length != 0) {
            return filterServer[0];
        } else {
            return null;
        }
    }

    private playYoutube(connection: VoiceConnection, channel: TextChannel | DMChannel | NewsChannel, server: DiscordServer): void {
        const musicQueue = server.musicQueue.list;

        if (musicQueue.length === 0) {
            channel.send("노래 재생이 종료되었습니다.");
            connection.disconnect();
            return;
        }

        const stream = ytdl(musicQueue[0].url, {filter: "audioonly"});

        server.setMusicPlayer(connection.play(stream)
            .on("start", () => {
                channel.send(`${musicQueue[0].title}를(을) 재생중입니다.\n재생시간 : ${musicQueue[0].time}`);
            })
            .on("end", (skip) => {
                if (musicQueue[0]) {
                    if (skip) {
                        channel.send(`${musicQueue[0].title}를(을) 스킵하였습니다.`);
                    } else {
                        channel.send(`${musicQueue[0].title}를(을) 재생하였습니다.`);
                    }

                    musicQueue.shift();

                    this.playYoutube(connection, channel, server);
                } else {
                    channel.send("노래 재생이 종료되었습니다.");
                    connection.disconnect();
                }
            })
        );

        musicQueue[0].state = true;
    }

    private addYoutubeQueue(message: Discord.Message, server: DiscordServer, videoUrl: string): void {
        const musicQueue = server.musicQueue.list;
        
        if (message.member == null) {
            message.channel.send("요청자를 찾을 수 없습니다.");
            return;
        }
        const member = message.member;

        if (!member.voice.channel) {
            message.channel.send("요청자가 음성채널에 없습니다.");
            return;
        }

        if (musicQueue.length > 5) {
            message.channel.send("대기열은 최대 5개까지만 등록이 가능합니다.");
            return;
        }

        message.channel.send("로딩중......").then((editMsg) => {
            try {
                ytdl.getInfo(videoUrl).then(value => {
                    const videoLength = value.player_response.videoDetails.lengthSeconds;

                    let videoHour = (Number(videoLength) / 3600).toFixed(0);
                    let videoMinute = (Number(videoLength) / 60).toFixed(0);
                    let videoSecond = (Number(videoLength) % 60).toFixed(0);

                    videoHour = Number(videoHour) > 9 ? videoHour : "0" + videoHour;
                    videoMinute = Number(videoMinute) > 9 ? videoMinute : "0" + videoMinute;
                    videoSecond = Number(videoSecond) > 9 ? videoSecond : "0" + videoSecond;

                    server.musicQueue.enqueue(new YoutubeVideo(videoUrl, `${videoHour}:${videoMinute}:${videoSecond}`, value.player_response.videoDetails.title, false));

                    editMsg.edit(value.player_response.videoDetails.title + "가 추가되었습니다.");

                    if (musicQueue[0] && !musicQueue[0].state) {
                        if (member.voice.channel) {
                            member.voice.channel.join().then(connection => {
                                this.playYoutube(connection, message.channel, server);
                            });
                        }
                    }
                });
            } catch (err) {
                editMsg.edit("잘못된 주소거나 영상이 존재하지 않습니다.");
            }
        });
    }

    private setYoutubeVolumeControl(message: Discord.Message, server: DiscordServer, option: string): void {
        const musicPlayer = server.getMusicPlayer();

        if (musicPlayer == null) {
            message.channel.send("플레이어를 아직 사용하지 않았습니다.");
            return;
        }

        const volumeControlData = 0.2, volumeControlMin = 0, volumeControlMax = 2;

        if (option == "증가") {
            if (musicPlayer.volume < volumeControlMax) {
                musicPlayer.setVolume(musicPlayer.volume + volumeControlData);
                message.channel.send("소리가 증가되었습니다.");
            } else {
                musicPlayer.setVolume(volumeControlMax);
                message.channel.send("더이상 조절할 수 있는 볼륨 단계가 없습니다.");
            }
        } else if (option == "감소") {
            if (musicPlayer.volume > volumeControlMin) {
                musicPlayer.setVolume(musicPlayer.volume - volumeControlData);
                message.channel.send("소리가 감소되었습니다.");
            } else {
                musicPlayer.setVolume(volumeControlMin);
                message.channel.send("더이상 조절할 수 있는 볼륨 단계가 없습니다.");
            }
        } else if (option == "초기화") {
            musicPlayer.setVolume(1);
            message.channel.send("소리가 초기화되었습니다.");
        }
        message.channel.send("현재 소리 크기 : " + (musicPlayer.volume / volumeControlMax * 100).toFixed(0) + "%");
    }

    private pauseYoutubePlayer(message: Discord.Message, musicPlayer: StreamDispatcher | null): void {
        if (musicPlayer == null) {
            message.channel.send("플레이어를 아직 사용하지 않았습니다.");
            return;
        }

        if (musicPlayer.paused) {
            musicPlayer.resume();
            message.channel.send("노래를 다시 재생합니다.");
        } else {
            musicPlayer.pause();
            message.channel.send("노래를 일시정지합니다.");
        }
    }

    private skipYoutubeVideo(musicPlayer: StreamDispatcher | null): void {
        if (musicPlayer != null) {
            musicPlayer.end("skip");
        }
    }

    private getPlayList(message: Discord.Message, list: YoutubeVideo[]): void {
        if (list.length > 0) {
            const videoArr: {name: string, value: string}[] = [];

            list.forEach((value, index) => {
                videoArr.push({name: `${(index + 1)}순위 ${(value.state ? "- (현재 재생중)" : "")}`, value: `${value.title}/${value.time}`});
            });

            message.channel.send({
                embed: {
                    color: 3447003,
                    title: "재생 목록",
                    fields: videoArr
                }
            });
        } else {
            message.channel.send("현재 재생 대기열이 없습니다.");
        }
    }

    private stopPlayer(message: Discord.Message, server: DiscordServer): void {
        if (message.guild != null &&  message.guild.voice != null) {
            if (message.guild.voice.channel) message.guild.voice.channel.leave();
        }
        server.musicQueue.list = [];
    }
}