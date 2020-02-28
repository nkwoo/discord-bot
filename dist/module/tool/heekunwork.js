"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.heeKunHoliday = heeKunHoliday;
exports.heeKunHolidayfileExist = heeKunHolidayfileExist;

var _heekunholiday = require("../../../data/heekunholiday.json");

var _heekunholiday2 = _interopRequireDefault(_heekunholiday);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    var nowYear = nowDate.getFullYear();
    var nowMonth = nowDate.getMonth() + 1;
    var nowDay = nowDate.getDate();
    var returnObject = { code: -1, name: "정보가 없습니다." };
    for (var i = 0; i < _heekunholiday2.default.length; i++) {
        if (_heekunholiday2.default[i].year != nowYear) {
            continue;
        }

        var yearOfMonthData = _heekunholiday2.default[i].data;
        for (var j = 0; j < yearOfMonthData.length; j++) {
            if (yearOfMonthData[j].month != nowMonth) {
                continue;
            }

            if (yearOfMonthData[j].data.holiday.find(function (item) {
                return item === nowDay;
            })) {
                returnObject = { code: 1, name: "쉬는날" };
            } else if (yearOfMonthData[j].data.afterwork.find(function (item) {
                return item === nowDay;
            })) {
                returnObject = { code: 2, name: "주간" };
            } else if (yearOfMonthData[j].data.nightwork.find(function (item) {
                return item === nowDay;
            })) {
                returnObject = { code: 3, name: "야간" };
            } else {
                returnObject = { code: -1, name: "정보가 없습니다." };
            }
        }
    }
    return returnObject;
}

function heeKunHolidayfileExist() {
    if (_heekunholiday2.default != null) return true;else return false;
}