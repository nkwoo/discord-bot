import {HeeGunHoliday} from "./interface/HeeGunHoliday";
import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";

import heeKunHolidayJson from "../../../data/heekunholiday.json";
import {Util} from "./interface/Util";
import {UtilImpl} from "./UtilImpl";

const DATE_PATTERN = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
const NUMBER_PATTERN = /^[0-9]*$/;

export class HeeGunHolidayImpl implements HeeGunHoliday {
    private readonly util: Util;

    constructor() {
        this.util = new UtilImpl();
    }

    checkHeeKunHoliday(channel: TextChannel | DMChannel | GroupDMChannel, parameter: string = "1"): void {
        if (heeKunHolidayJson == null) {
            channel.send({
                embed: {
                    color: 3447003,
                    title: "희건이 상태",
                    description: "쉬는날 파일을 불러올수 없습니다."
                }
            });
            return;
        }

        if (DATE_PATTERN.test(String(parameter))) {
            let parameterToDate = new Date(Number(parameter.substring(0, 4)), Number(parameter.substring(5, 7)) - 1, parseInt(parameter.substring(8, 10)), 0, 0, 0);

            channel.send({
                embed: {
                    color: 3447003,
                    title: "희건이 상태",
                    fields: [{
                        name: `${this.util.getDateToString(parameterToDate, "-", "YYYY-MM-DD")} ${this.util.getWeekOfDay(parameterToDate.getDay())}`,
                        value: heeKunHoliday(parameterToDate).name
                    }]
                }
            });
        } else if (NUMBER_PATTERN.test(parameter)) {
            const dayCount = parseInt(parameter);

            if (dayCount < 1 || 7 < dayCount) {
                channel.send({
                    embed: {
                        color: 3447003,
                        title: "희건이 상태",
                        description: "조회할 날짜 수 범위를 지켜주세요. (1 ~ 7)"
                    }
                });
                return;
            }

            let printDataArr = [];
            let nowDate = new Date();

            for (let i = 0; i < dayCount; i++) {

                printDataArr.push({
                    name: `${this.util.getDateToString(nowDate, "-", "YYYY-MM-DD")} ${this.util.getWeekOfDay(nowDate.getDay())}`,
                    value: heeKunHoliday(nowDate).name
                });

                nowDate.setDate(nowDate.getDate() + 1);
            }

            channel.send({
                embed: {
                    color: 3447003,
                    title: "희건이 상태",
                    fields: printDataArr
                }
            });
        } else {
            channel.send({
                embed: {
                    color: 3447003,
                    title: "희건이 상태",
                    description: "!희건 <오늘 부터 조회할 날짜 수> 또는 <조회할 날짜(YYYY-MM-DD)>\n명령어를 올바르게 기입해주세요."
                }
            });
        }
    }
}

function heeKunHoliday(nowDate: Date): {code: number, name: string} {
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() +1;
    let nowDay = nowDate.getDate();
    let returnObject = { code: -1, name: "정보가 없습니다." };
    for (let i = 0; i < heeKunHolidayJson.length; i++) {
        if (heeKunHolidayJson[i].year != nowYear) {
            continue;
        }

        let yearOfMonthData = heeKunHolidayJson[i].data;
        for (let j = 0; j < yearOfMonthData.length; j++) {
            if(yearOfMonthData[j].month != nowMonth) {
                continue;
            }

            if ( yearOfMonthData[j].data.holiday.find(item => item === nowDay)) {
                returnObject = { code: 1, name: "쉬는날" };
            } else if (yearOfMonthData[j].data.afterwork.find(item => item === nowDay)) {
                returnObject = { code: 2, name: "주간" };
            } else if (yearOfMonthData[j].data.nightwork.find(item => item === nowDay)) {
                returnObject = { code: 3, name: "야간" };
            } else {
                returnObject = { code: -1, name: "정보가 없습니다." };
            }
        }
    }
    return returnObject;
}