import {Maple} from "../service/interface/Maple";
import {HtmlParser} from "../../global/HtmlParser";
import {MapleImpl} from "../service/MapleImpl";
import Discord, {DMChannel, MessageEmbed, NewsChannel, TextChannel} from "discord.js";
import {MapleCharacterDto} from "../dto/MapleCharacterDto";
import {CallCommand} from "../enum/CallCommand";

export class MapleStoryController {
    private readonly maple: Maple;

    constructor(private htmlParser: HtmlParser) {
        this.maple = new MapleImpl(this.htmlParser);
    }

    callCommand(message: Discord.Message, command: CallCommand, args: string[]): void {
        if (command === CallCommand.MapleScore) {
            if (args.length < 2 || message.content.indexOf("\"") === -1 || message.content.lastIndexOf("\"") === -1) {
                message.channel.send("닉네임이 포함되어 있지 않습니다.");
                return;
            }

            const nickname = encodeURIComponent(message.content.substring(message.content.indexOf("\"") + 1, message.content.lastIndexOf("\"")).trim());

            this.getUserData(message.channel, nickname);
        }
    }

    private getUserData(channel: TextChannel | DMChannel | NewsChannel, nickname: string) {
        channel.send("데이터 조회중......").then(async (editMsg) => {
            const mapleCharacterDto = await this.maple.searchMaplePlayerData(nickname);

            if (mapleCharacterDto && mapleCharacterDto.state && mapleCharacterDto instanceof MapleCharacterDto) {
                await editMsg.edit("데이터 조회 성공 ✅");
                await channel.send({files: [mapleCharacterDto.thumbnailUrl]});
                await channel.send(new MessageEmbed()
                    .setTitle("메이플 닉네임 검색")
                    .setColor("#3399CC")
                    .setDescription("메이플 캐릭터 정보")
                    .setURL("https://maplestory.nexon.com/Ranking/World/Total?c=" + mapleCharacterDto.nickname)
                    .addField("닉네임", mapleCharacterDto.nickname, true)
                    .addField("직업", mapleCharacterDto.job, true)
                    .addField("월드 랭킹", mapleCharacterDto.worldRank, true)
                    .addField("레벨", mapleCharacterDto.level, true));
            } else {
                editMsg.edit("데이터 조회 실패 ❌").then(() => channel.send(mapleCharacterDto ? mapleCharacterDto.message : "캐릭터 정보를 가져올 수 없습니다."));
            }
        });
    }
}