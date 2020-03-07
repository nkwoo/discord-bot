//요일 배열
const weekOfDayArray = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

//정규식
export const datePattern = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
export const numberPattern = /^[0-9]*$/;

export function DayToString(day) {
    return weekOfDayArray[day];
}

export function dateToString(date, selector, option) {
    if (date instanceof Date) {
        if (option === "YYYYMMDDHH24MISS") {
            return date.getFullYear()
                + selector
                + ((date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : "0" + (date.getMonth() + 1))
                + selector
                + (date.getDate() > 9 ? date.getDate() : "0" + date.getDate())
                + " "
                + (date.getHours() > 9 ? date.getHours() : "0" + date.getHours())
                + ":"
                + (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes())
                + ":"
                + (date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds());
        } else if (option === "YYYY-MM-DD") {
            return date.getFullYear()
                + selector
                + ((date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : "0" + (date.getMonth() + 1))
                + selector
                + (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
        }
    } else {
        if (option === "YYYYMMDDHH24MISS") {
            return `1970${selector}01${selector}01 00:00:00`;
        } else if (option === "YYYY-MM-DD") {
            return `1970${selector}01${selector}01`;
        }
    }
}