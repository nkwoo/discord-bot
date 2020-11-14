import {Translation} from "./interface/Translation";
import {DMChannel, GroupDMChannel, Message, TextChannel} from "discord.js";
import {HtmlParser} from "../HtmlParser";
import {getLanguage, getLanguageKorean, Language} from "../../enum/Language";

const getDectUrl = "https://papago.naver.com/apis/langs/dect";
const getTranslationTextUrl = "https://openapi.naver.com/v1/papago/n2mt";

export class TranslationImpl implements Translation {

    constructor(private htmlParser: HtmlParser) {
    }

    translationLang(channel: TextChannel | DMChannel | GroupDMChannel, content: string, target: string): void {
        channel.send("데이터 조회중......").then((editMsg) => {
            const targetLang = getLanguage(target);

            if (checkKnownLang(channel, editMsg, targetLang)) return;

            const headerJson = {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
                "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET
            };

            this.htmlParser.getPostJson<PapagoDest>(getDectUrl, headerJson, {query: content}).then((json) => {
                if (json === undefined) {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("데이터 조회 도중 오류가 발생하였습니다..");
                    return;
                }

                const sourceLang = getLanguage(json.data.langCode);
                if (checkKnownLang(channel, editMsg, sourceLang)) return;

                if (sourceLang === targetLang) {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("동일한 언어로 번역이 불가능합니다..");
                    return true;
                }

                const parameterJson = {
                    "source": sourceLang,
                    "target": targetLang,
                    "text": content
                };

                this.htmlParser.getPostJson<ApiMessage>(getTranslationTextUrl, headerJson, parameterJson).then((json) => {
                    if (json === undefined) {
                        editMsg.edit("데이터 조회 실패 ❌");
                        channel.send("번역 도중 오류가 발생하였습니다..");
                        return;
                    }

                    if (json.data.errorCode !== undefined) {
                        editMsg.edit("데이터 조회 실패 ❌");
                        channel.send(json.data.errorMessage);
                        return;
                    }

                    const resultData = json.data.message.result;

                    const printDataArr = [
                        {name: "번역 대상 언어", value: getLanguageKorean(resultData.srcLangType)},
                        {name: "번역 결과 언어", value: getLanguageKorean(resultData.tarLangType)}
                    ];

                    editMsg.edit("데이터 조회 성공 ✅");

                    channel.send({
                        embed: {
                            color: 3447003,
                            title: "번역 결과",
                            fields: printDataArr
                        }
                    });

                    channel.send("```" + resultData.translatedText + "```");
                });
            });
        });
    }

    getTranslationCode(channel: TextChannel | DMChannel | GroupDMChannel): void {
        const printDataArr: {name: string, value: string}[] = [];
        
        Object.values(Language).filter(value => value !== Language.KNOWN).forEach(value => printDataArr.push({ name: value, value: getLanguageKorean(value)}));

        channel.send({
            embed: {
                color: 3447003,
                title: "번역코드값",
                fields: printDataArr
            }
        });
    }
}

function checkKnownLang(channel: TextChannel | DMChannel | GroupDMChannel, editMsg: Message, lang: Language) {
    if (lang === Language.KNOWN) {
        editMsg.edit("데이터 조회 실패 ❌");
        channel.send("변경할 수 없는 언어입니다..");
        return true;
    }

    return false;
}

interface PapagoDest {
    langCode: string
}

interface ApiMessage {
    message: {
        result: {
            srcLangType: string,
            tarLangType: string,
            translatedText: string
        }
    },
    errorMessage: string,
    errorCode: string
}