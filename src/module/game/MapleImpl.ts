import {DMChannel, GroupDMChannel, RichEmbed, TextChannel} from "discord.js";
import {Maple} from "./interface/Maple";
import {HtmlParser} from "../HtmlParser";

const maplePersonSearchUrl = "https://maplestory.nexon.com/Ranking/World/Total";

export class MapleImpl implements Maple {

    private htmlParser: HtmlParser;

    constructor() {
        this.htmlParser = new HtmlParser();
    }

    searchMaplePlayerData(channel: TextChannel | DMChannel | GroupDMChannel, name: string, type: number): void {

        /*
        * 20190626
        * 메이플 데이터 가져올때 사용
        * message : 디스코드 메세지 변수
        * nickname : 닉네임
        * type : 랭킹월드 구분 / 0 = 리부트 제외한 전체월드 / 254 = 리부트 월드들
        */

        let worldRank: string,
            characterName: string,
            characterJob: string,
            characterLevel: string;

        channel.send("데이터 조회중......").then((editMsg) => {
            this.htmlParser.getHtmlDocument(`${maplePersonSearchUrl}?c=${name}&w=${type}`).then((html) => {
                if (html != undefined) {
                    const $ = this.htmlParser.changeHtmlToDom(html.data);

                    $('.search_com_chk > td:nth-child(1) > p:nth-child(1)').each((index, element) => {                  //랭킹
                        worldRank = $(element).text().trim();
                    });
                    $('.search_com_chk > td:nth-child(2) > dl > dt').each((index, element) => {                         //닉네임
                        characterName = $(element).text().trim();
                    });
                    $('.search_com_chk > td:nth-child(2) > dl > dd').each((index, element) => {                         //직업
                        characterJob = $(element).text().trim();
                    });
                    $('.search_com_chk > td:nth-child(3)').each((index, element) => {                                   //레벨
                        characterLevel = $(element).text().trim();
                    });

                    $('.search_com_chk > td:nth-child(2) > span > img:nth-child(1)').each((index, element) => {         //캐릭터사진
                        const embedMessage = new RichEmbed()
                            .setTitle("메이플 닉네임 검색")
                            .setColor("#3399CC")
                            .setDescription("당신의 쪼렙 메이플 닉네임 검색 해드립니다.")
                            .setURL(maplePersonSearchUrl + "?c=" + name)
                            .addField("닉네임", characterName, true)
                            .addField("직업", characterJob, true)
                            .addField("월드 랭킹", worldRank, true)
                            .addField("레벨", characterLevel, true);

                        editMsg.edit("데이터 조회 성공 ✅");
                        channel.send({files: [$(element)[0].attribs.src]}).then(() => channel.send(embedMessage));
                    });

                    if (worldRank == null || characterName == null || characterJob == null) {
                        if (type == 0) {
                            this.searchMaplePlayerData(channel, name, 254);
                        } else {
                            editMsg.edit("데이터 조회 실패 ❌");
                            channel.send("검색 안되는거 보니 메이플 안하시나봄;");
                        }
                    }
                } else {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("데이터를 가져올 수 없습니다.");
                }
            });
        });
    }
}