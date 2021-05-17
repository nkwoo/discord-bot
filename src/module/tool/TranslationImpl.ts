import {Translation} from "./interface/Translation";
import {DMChannel, GroupDMChannel, Message, TextChannel} from "discord.js";
import {HtmlParser} from "../HtmlParser";
import {getLanguage, getLanguageKorean, Language} from "../../enum/Language";
import {GlobalConfig} from "../../global/GlobalConfig";
import {HttpMethod} from "../../enum/HttpMethod";

const PAPAGO_DESC_URL = "https://openapi.naver.com/v1/papago/detectLangs";
const PAPAGO_TRANSLATION_URL = "https://openapi.naver.com/v1/papago/n2mt";

export class TranslationImpl implements Translation {

    private nmtHeaderJson: NaverApiHeader;
    private descHeaderJson: NaverApiHeader;

    constructor(private htmlParser: HtmlParser, private globalConfig: GlobalConfig) {
        this.nmtHeaderJson = {
            "Content-Type": "application/json",
            "X-Naver-Client-Id": globalConfig.apiKey.naver.papago.nmt.clientId,
            "X-Naver-Client-Secret": globalConfig.apiKey.naver.papago.nmt.clientSecret
        }
        this.descHeaderJson = {
            "Content-Type": "application/json",
            "X-Naver-Client-Id": globalConfig.apiKey.naver.papago.detectLang.clientId,
            "X-Naver-Client-Secret": globalConfig.apiKey.naver.papago.detectLang.clientSecret
        }
    }

    translationLang(channel: TextChannel | DMChannel | GroupDMChannel, content: string, target: string): void {
        channel.send("데이터 조회중......").then((editMsg) => {
            const targetLang = getLanguage(target);

            if (checkKnownLang(channel, editMsg, targetLang)) return;

            this.htmlParser.requestHeaderParameterData<PapagoDest>(HttpMethod.POST, PAPAGO_DESC_URL, this.descHeaderJson, {query: content}).then((destJson) => {
                if (destJson === undefined) {
                    editMsg.edit("데이터 조회 실패 ❌").then(() => channel.send("데이터 조회 도중 오류가 발생하였습니다.."));
                    return;
                }

                const sourceLang = getLanguage(destJson.data.langCode);
                if (checkKnownLang(channel, editMsg, sourceLang)) return;

                if (sourceLang === targetLang) {
                    editMsg.edit("데이터 조회 실패 ❌").then(() => channel.send("동일한 언어로 번역이 불가능합니다.."));
                    return true;
                }

                const parameterJson = {
                    "source": sourceLang,
                    "target": targetLang,
                    "text": content
                };

                this.htmlParser.requestHeaderParameterData<ApiMessage>(HttpMethod.POST, PAPAGO_TRANSLATION_URL, this.nmtHeaderJson, parameterJson).then((json) => {
                    if (json === undefined) {
                        editMsg.edit("데이터 조회 실패 ❌").then(() => channel.send("번역 도중 오류가 발생하였습니다.."));
                        return;
                    }

                    const jsonData = json.data;

                    if (jsonData.errorCode !== undefined) {
                        editMsg.edit("데이터 조회 실패 ❌").then(() => channel.send(jsonData.errorMessage));
                        return;
                    }

                    const resultData = jsonData.message.result;

                    editMsg.edit("데이터 조회 성공 ✅").then(() => {
                        channel.send({
                            embed: {
                                color: 3447003,
                                title: "번역 결과",
                                fields: [
                                    {name: "번역 대상 언어", value: getLanguageKorean(resultData.srcLangType)},
                                    {name: "번역 결과 언어", value: getLanguageKorean(resultData.tarLangType)}
                                ]
                            }
                        }).then(() => {
                            channel.send("```" + resultData.translatedText + "```");
                        });
                    });
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

    //TODO 맞춤법 로직 번역로직에 있는데 분리 해야할까?
    checkSpellMessage(channel: TextChannel | DMChannel | GroupDMChannel, content: string): void {
        channel.send("데이터 조회중......").then((editMsg) => {
            this.htmlParser.requestNoHeaderParameterData<ApiSpellInfo>(HttpMethod.GET, `https://search.naver.com/p/csearch/ocontent/util/SpellerProxy?q=${encodeURI(content)}&where=nexearch&color_blindness=0`).then((json) => {
                if (json === undefined) {
                    editMsg.edit("데이터 조회 실패 ❌").then(() => channel.send("맞춤법 정보를 가져올 수 없습니다.."));
                    return;
                }

                editMsg.edit("데이터 조회 성공 ✅").then(() => {
                    channel.send({
                        embed: {
                            color: 3447003,
                            title: "맞춤법 검사기",
                            fields: [
                                {name: "교정전 텍스트", value: content},
                                {name: "교정후 텍스트", value: json.data.message.result.notag_html}
                            ]
                        }
                    });
                });
            });
        });
    }
}

function checkKnownLang(channel: TextChannel | DMChannel | GroupDMChannel, editMsg: Message, lang: Language) {
    if (lang === Language.KNOWN) {
        editMsg.edit("데이터 조회 실패 ❌").then(() => channel.send("변경할 수 없는 언어입니다.."));
        return true;
    }

    return false;
}

interface NaverApiHeader {
    "Content-Type": string,
    "X-Naver-Client-Id": string,
    "X-Naver-Client-Secret": string
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

interface ApiSpellInfo {
    message: {
        result:{
            errata_count: number,
            origin_html: string,
            html: string,
            notag_html: string
        }
    }
}