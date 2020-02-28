import heeKunHolidayJson from "../../../data/heekunholiday.json";

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
export function heeKunHoliday(nowDate) {
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

export function heeKunHolidayfileExist(){
    if (heeKunHolidayJson != null)
        return true;
    else 
        return false;
}