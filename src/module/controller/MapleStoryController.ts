import {Maple} from "../game/interface/Maple";
import {HtmlParser} from "../HtmlParser";
import {MapleImpl} from "../game/MapleImpl";
import {DMChannel, GroupDMChannel, RichEmbed, TextChannel} from "discord.js";
import {MapleCharacterDto} from "../../dto/MapleCharacterDto";

export class MapleStoryController {
    private readonly maple: Maple;

    constructor(private htmlParser: HtmlParser) {
        this.maple = new MapleImpl(this.htmlParser);
    }

    callCommand(channel: TextChannel | DMChannel | GroupDMChannel, command: string, message: string, args: string[]): void {
        if (command === "메이플") {
            if (args.length < 2 || message.indexOf("\"") === -1 || message.lastIndexOf("\"") === -1) {
                channel.send("닉네임이 포함되어 있지 않습니다.");
                return;
            }

            const nickname = encodeURIComponent(message.substring(message.indexOf("\"") + 1, message.lastIndexOf("\"")).trim());

            this.getUserData(channel, nickname);
        }
    }

    private getUserData(channel: TextChannel | DMChannel | GroupDMChannel, nickname: string) {
        channel.send("데이터 조회중......").then(async (editMsg) => {
            const mapleCharacterDto = await this.maple.searchMaplePlayerData(nickname);

            if (mapleCharacterDto && mapleCharacterDto.state && mapleCharacterDto instanceof MapleCharacterDto) {
                await editMsg.edit("데이터 조회 성공 ✅");
                await channel.send({files: [mapleCharacterDto.thumbnailUrl]});
                await channel.send(new RichEmbed()
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