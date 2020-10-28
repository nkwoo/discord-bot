import {Weather} from "./interface/Weather";
import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";
import {HtmlParser} from "../HtmlParser";
import {xml2json} from "xml-js";

const wearther3DayInUrl = 'http://www.kma.go.kr/wid/queryDFSRSS.jsp?zone=1100000000';
const wearther3DayOutUrl = 'http://www.weather.go.kr/weather/forecast/mid-term-rss3.jsp?stnId=109';

export class WeatherImpl implements Weather {
    private htmlParser: HtmlParser;

    constructor() {
        this.htmlParser = new HtmlParser();
    }

    getSeoulWeather(channel: TextChannel | DMChannel | GroupDMChannel) {
        channel.send("데이터 조회중......").then((editMsg) => {
            const printDataArr: { name: any; value: string; }[] = [];
            this.htmlParser.getHtmlDocument(wearther3DayInUrl).then(html => {

                if (!html) {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                    return;
                }

                let resultJson = JSON.parse(xml2json(html.data, {compact: true, spaces: 4}));
                let dataArr = resultJson.rss.channel.item.description.body.data;
                let checkNextDay = "";
                let nowDate = new Date();

                for (let j = 0; j < dataArr.length; j++) {
                    if (dataArr[j].day._text != checkNextDay) {
                        let printStr = nowDate.getFullYear() + "-" + ((nowDate.getMonth() + 1) > 9 ? (nowDate.getMonth() + 1) : "0" + (nowDate.getMonth() + 1)) + "-" + (nowDate.getDate() > 9 ? nowDate.getDate() : "0" + nowDate.getDate());
                        let printData = "날씨 : " + dataArr[j].wfKor._text + "\n최저온도 : " + Number(dataArr[j].tmn._text) + "도\n최고온도 : " + Number(dataArr[j].tmx._text);
                        nowDate.setDate(nowDate.getDate() + 1);
                        printDataArr.push({ name: printStr, value: printData});
                        checkNextDay = dataArr[j].day._text;
                    }
                }

                this.htmlParser.getHtmlDocument(wearther3DayOutUrl).then(html => {

                    if (!html) {
                        editMsg.edit("데이터 조회 실패 ❌");
                        channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                        return;
                    }

                    let result2 = JSON.parse(xml2json(html.data, {compact: true, spaces: 4}));
                    let dataArr = result2.rss.channel.item.description.body.location;

                    for(let j = 1; j < 11; j = j + 2) {
                        let printStr = dataArr[0].data[j].tmEf._text.substring(0,10);
                        let printData = "날씨 : " + dataArr[0].data[j].wf._text + "\n최저온도 : " + dataArr[0].data[j].tmn._text + "도\n최고온도 : " + dataArr[0].data[j].tmx._text;
                        printDataArr.push({ name: printStr, value: printData});
                    }

                    editMsg.edit("데이터 조회 성공 ✅");
                    channel.send({
                        embed: {
                            color: 3447003,
                            title: "날씨",
                            description: "서울시 날씨 데이터입니다!",
                            fields: printDataArr
                        }
                    });
                });
            });
        });
    }
}