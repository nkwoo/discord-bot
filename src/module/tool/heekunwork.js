import heeKunHolidayJson from "../../../data/heekunholiday.json";
import * as util from "./util";

export function checkHeeKunHoliday(message, countParameter) {

    if (heeKunHolidayJson == null) {
        message.channel.send({
            embed: {
                color: 3447003,
                title: "희건이 상태",
                description: "쉬는날 파일을 불러올수 없습니다."
            }
        });
        return;
    }

    if (countParameter == undefined)
        countParameter = 1;

    if (util.datePattern.test(countParameter)) {
        let parameterToDate = new Date(countParameter.substring(0,4), Number(countParameter.substring(5,7)) -1, countParameter.substring(8,10), 0, 0, 0);

        message.channel.send({
            embed: {
                color: 3447003,
                title: "희건이 상태",
                fields: [{
                    name: `${util.dateToString(parameterToDate, "-", "YYYY-MM-DD")} ${util.DayToString(parameterToDate.getDay())}`,
                    value: heeKunHoliday(parameterToDate).name
                }]
            }
        });
    } else if (util.numberPattern.test(countParameter)) {
        countParameter = Number(countParameter);

        if (countParameter < 1 || 7 < countParameter) {
            message.channel.send({
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

        for (let i = 0; i < countParameter; i++) {

            printDataArr.push({
                name: `${util.dateToString(nowDate, "-", "YYYY-MM-DD")} ${util.DayToString(nowDate.getDay())}`,
                value: heeKunHoliday(nowDate).name
            });

            nowDate.setDate(nowDate.getDate() + 1);
        }

        message.channel.send({
            embed: {
                color: 3447003,
                title: "희건이 상태",
                fields: printDataArr
            }
        });
    } else {
        message.channel.send({
            embed: {
                color: 3447003,
                title: "희건이 상태",
                description: "!희건 <오늘 부터 조회할 날짜 수> 또는 <조회할 날짜(YYYY-MM-DD)>\n명령어를 올바르게 기입해주세요."
            }
        });
    }
}

/**
* 20190706
* 유희건 회사 가는날 여부 확인 함수
* retrun json
{
    code: 코드
    name: 메시지
}

* -1 = 해당 데이터가 없다
*  1 = 휴일
*  2 = 주간
*  3 = 야간
* */

function heeKunHoliday(nowDate) {
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() +1;
    let nowDay = nowDate.getDate();
    let returnObject = { code: -1, name: "정보가 없습니다." };
    for (let i = 0; i < heeKunHolidayJson.length; i++) {
        if(heeKunHolidayJson[i].year != nowYear) {
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