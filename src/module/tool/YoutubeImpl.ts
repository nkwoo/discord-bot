import {YouTube} from "./interface/Youtube";
import {DMChannel, GroupDMChannel, Message, StreamDispatcher, TextChannel, VoiceConnection} from "discord.js";
import ytdl from "ytdl-core";
// https://github.com/fent/node-ytdl-core#usage
import {DiscordServer} from "../discord/DiscordServer";
import {YoutubeVideo} from "../discord/YoutubeVideo";

export class YoutubeImpl implements YouTube {
    addYoutube(message: Message, server: DiscordServer, videoUrl: string): void {
        const musicQueue = server.musicQueue.list;

        if (!message.member.voiceChannel) {
            message.channel.send("방에 들어가야지 노래를 들려주징;;");
            return;
        }

        if (musicQueue.length > 5) {
            message.channel.send("대기열은 최대 5개까지만 등록이 가능합니다.");
            return;
        }

        message.channel.send("로딩중......").then((editMsg) => {
            try {
                ytdl.getInfo(videoUrl, {quality: "highestaudio"}).then(value => {
                    const videoLength = value.player_response.videoDetails.lengthSeconds;
                    let videoHour = (Number(videoLength) / 3600).toFixed(0);
                    let videoMinute = (Number(videoLength) / 60).toFixed(0);
                    let videoSecond = (Number(videoLength) % 60).toFixed(0);

                    videoHour = Number(videoHour) > 9 ? videoHour : "0" + videoHour;
                    videoMinute = Number(videoMinute) > 9 ? videoMinute : "0" + videoMinute;
                    videoSecond = Number(videoSecond) > 9 ? videoSecond : "0" + videoSecond;

                    server.musicQueue.enqueue(new YoutubeVideo(videoUrl, `${videoHour}:${videoMinute}:${videoSecond}`, value.player_response.videoDetails.title, false));

                    editMsg.edit(value.player_response.videoDetails.title + "가 추가되었습니다.");

                    if (!message.guild.voiceConnection && musicQueue[0] && !musicQueue[0].state) {
                        message.member.voiceChannel.join().then(connection => {
                            this.playYoutube(connection, message.channel, server, musicQueue);
                        });
                    }
                });
            } catch (err) {
                editMsg.edit("잘못된 주소거나 영상이 존재하지 않습니다.");
            }
        });
    }

    setYoutubeVolumeControl(channel: TextChannel | DMChannel | GroupDMChannel, musicPlayer: StreamDispatcher | null, option: string): void {
        if (musicPlayer == null) {
            channel.send("플레이어를 아직 사용하지 않았습니다.");
            return;
        }

        const volumeControlData = 0.2, volumeControlMin = 0, volumeControlMax = 2;

        if (option == "증가") {
            if (musicPlayer.volume < volumeControlMax) {
                musicPlayer.setVolume(musicPlayer.volume + volumeControlData);
                channel.send("소리가 증가되었습니다.");
            } else {
                musicPlayer.setVolume(volumeControlMax);
                channel.send("더이상 조절할 수 있는 볼륨 단계가 없습니다.");
            }
        } else if (option == "감소") {
            if (musicPlayer.volume > volumeControlMin) {
                musicPlayer.setVolume(musicPlayer.volume - volumeControlData);
                channel.send("소리가 감소되었습니다.");
            } else {
                musicPlayer.setVolume(volumeControlMin);
                channel.send("더이상 조절할 수 있는 볼륨 단계가 없습니다.");
            }
        } else if (option == "초기화") {
            musicPlayer.setVolume(1);
            channel.send("소리가 초기화되었습니다.");
        }
        channel.send("현재 소리 크기 : " + (musicPlayer.volume / volumeControlMax * 100).toFixed(0) + "%");
    }

    pauseYoutubePlayer(channel: TextChannel | DMChannel | GroupDMChannel, musicPlayer: StreamDispatcher | null): void {
        if (musicPlayer == null) {
            channel.send("플레이어를 아직 사용하지 않았습니다.");
            return;
        }

        if (musicPlayer.paused) {
            musicPlayer.resume();
            channel.send("노래가 다시 재생됩니다.");
        } else {
            musicPlayer.pause();
            channel.send("노래가 일시정지합니다.");
        }
    }

    skipYoutubeVideo(musicPlayer: StreamDispatcher | null): void {
        if (musicPlayer) {
            musicPlayer.end("1");
        }
    }

    getPlayList(channel: TextChannel | DMChannel | GroupDMChannel, list: YoutubeVideo[]): void {
        if (list.length > 0) {
            const videoArr: {name: string, value: string}[] = [];

            list.forEach((value, index) => {
                videoArr.push({name: `${(index + 1)}순위 ${(value.state ? "- (현재 재생중)" : "")}`, value: `${value.title}/${value.time}`});
            });

            channel.send({
                embed: {
                    color: 3447003,
                    title: "재생 목록",
                    fields: videoArr
                }
            });
        } else {
            channel.send("현재 재생 대기열이 없습니다.");
        }
    }

    stopPlayer(message: Message): void {
        if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
    }


    private playYoutube(connection: VoiceConnection, channel: TextChannel | DMChannel | GroupDMChannel, server: DiscordServer, musicQueue: YoutubeVideo[]) {
        if (musicQueue.length === 0) {
            channel.send("노래 재생이 종료되었습니다.");
            connection.disconnect();
            return;
        }

        const stream = ytdl(musicQueue[0].url, { filter: "audioonly" });

        server.setMusicPlayer(connection.playStream(stream)
            .on("start", function () {
                channel.send(`${musicQueue[0].title}를(을) 재생중입니다.\n재생시간 : ${musicQueue[0].time}`);
            })
            .on("end", (check) => {
                if (musicQueue[0]) {
                    if (check) {
                        channel.send(`${musicQueue[0].title}를(을) 스킵하였습니다.`);
                    } else {
                        channel.send(`${musicQueue[0].title}를(을) 재생하였습니다.`);
                    }

                    musicQueue.shift();
                    this.playYoutube(connection, channel, server, musicQueue);
                } else {
                    channel.send("노래 재생이 종료되었습니다.");
                    connection.disconnect();
                }
            })
        );

        musicQueue[0].state = true;
    }
}