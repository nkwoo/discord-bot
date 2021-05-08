import {Knou} from "./interface/Knou";
import {HtmlParser} from "../HtmlParser";
import {KnouNoticeDto} from "../../database/dto/KnouNoticeDto";
import {DMChannel, GroupDMChannel, RichEmbed, TextChannel} from "discord.js";
import {KnouNoticeEntity} from "../../database/entity/domain/KnouNoticeEntity";

const knouNoticeUrl = "https://www.knou.ac.kr/bbs/knou/51/artclList.do";

const knouNoticeParameter = {
    layout: "",
    bbsClSeq: 168,
    bbsOpenWrdSeq: "",
    isViewMine: false,
    srchColumn: "sj",
    srchWrd: ""
};

export class KnouImpl implements Knou {

    constructor(private htmlParser: HtmlParser) {
    }

    async getNoticeData(): Promise<KnouNoticeDto[]> {
        const noticeData: KnouNoticeDto[] = [];

        await this.htmlParser.getPostHtml(knouNoticeUrl, knouNoticeParameter).then(html => {
            if (!html) {
                console.log("공지사항을 가져올 수 없습니다.");
                return;
            }

            const $ = this.htmlParser.changeHtmlToDom(html.data);

            $(".board-table > tbody > tr:not(.notice)").each((index, element) => {
                const titleText = $(element).children(".td-subject").children("a").children("strong").text();
                const writeDate = $(element).children(".td-date").text();
                const hrefLinkTextElement = $(element).children(".td-subject").children("a").attr("href");

                const hrefLinkText = hrefLinkTextElement !== undefined ? hrefLinkTextElement : "";

                const boardIdx = hrefLinkText.match(/[^/]+/gi);

                if (boardIdx) {
                    noticeData.push(new KnouNoticeDto(parseInt(boardIdx[3]), titleText, writeDate, hrefLinkText));
                }
            });
        });

        return noticeData;
    }

    async sendNotice(channel: TextChannel | DMChannel | GroupDMChannel, notice: KnouNoticeEntity): Promise<void> {
        return new Promise((resolve, reject) => {
            channel.send("새로운 공지사항이 업로드 되었습니다.").then(() => {
                channel.send(new RichEmbed()
                    .setColor("#3399CC")
                    .setTitle(notice.title)
                    .setURL(`https://www.knou.ac.kr${notice.postLink}`)
                    .setDescription(`공지사항 업로드일 : ${notice.writeDate}`)
                ).then(() => {
                    resolve();
                }).catch(reason => {
                    reject(reason);
                });
            }).catch(reason => {
                reject(reason);
            });
        });
    }
}