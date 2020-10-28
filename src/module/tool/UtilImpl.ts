import {Util} from "./interface/Util";

//요일 배열
const weekOfDayArray: Array<string> = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

export class UtilImpl implements Util {

    getDateToString(date: Date, selector: string, option: string): string {
        let dateStr = "";

        if (option === "YYYY-MM-DD") {
            dateStr = `${date.getFullYear()}${selector}${((date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : "0" + (date.getMonth() + 1))}${selector}${(date.getDate() > 9 ? date.getDate() : "0" + date.getDate())}`;
        }

        return dateStr;
    }

    getWeekOfDay(day: number): string {
        return weekOfDayArray[day];
    }

}