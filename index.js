const Discord = require("discord.js");                                                  //디스코드 봇 LIB
const YTDL = require("ytdl-core");                                                      //유투브 소리 재생
const httppas = require('cheerio-httpcli');                                             //웹 크롤러
const hgunDay = require('./data/hoil.json');                                            //희건이 쉬는날
const xmlConvert = require('xml-js');
const dotenv = require("dotenv");
const fs = require("fs");

const { exec } = require('child_process');

import * as customGame from "./module/game";
import * as customTool from "./module/tool";

const client = new Discord.Client();

let servers = {};
let timerQueue = [];

let administratorUserId = [356423613605478401];

let envPath;
switch (process.env.NODE_ENV) {
    case "prod":
        envPath = `${__dirname}/.env.prod`;
        break;
    case "dev":
        envPath = `${__dirname}/.env.dev`;
        break;
    default:
        envPath = `${__dirname}/.env.dev`;
        break;
}

const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

//날짜 정규식
const datePattern = /^(19|20)\d{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[0-1])$/;

/*
* 유저 권한 체크
*/
function permission (message) {
    let id = message.member.user.id;
    for (let i = 0; i < administratorUserId.length; i++) {
        if (administratorUserId[i] == id) return false;
    }
    message.channel.send("permission denied");
    return true;
}

/*
* 20190706
* 유희건 회사 날짜 함수
* retrun state code info
* -1 = 해당 데이터가 없다
*  1 = 휴일
*  2 = 주간
*  3 = 야간
* */
function heGunHoliData(nowDate) {
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() +1;
    let nowDay = nowDate.getDate();
    let returnCode = -1;
    for (let i = 0; i < hgunDay.length; i++) {
        if(hgunDay[i].year != nowYear) {
            continue;
        }

        let yearOfMonthData = hgunDay[i].data;
        for (let j = 0; j < yearOfMonthData.length; j++) {
            if(yearOfMonthData[j].month != nowMonth) {
                continue;
            } 

            if ( yearOfMonthData[j].data.holiday.find(item => item === nowDay)) {
                returnCode = 1;
            } else if (yearOfMonthData[j].data.afterwork.find(item => item === nowDay)) {
                returnCode = 2;
            } else if (yearOfMonthData[j].data.nightwork.find(item => item === nowDay)) {
                returnCode = 3;
            } else {
                returnCode = -1;
            }
        }
    }
    return returnCode;
}

function getWeekOfDay(day) {
    let returnDayStr = "";
    switch (day) {
        case 0:
            returnDayStr = "일요일";
            break;
        case 1:
            returnDayStr = "월요일";
            break;
        case 2:
            returnDayStr = "화요일";
            break;
        case 3:
            returnDayStr = "수요일";
            break;
        case 4:
            returnDayStr = "목요일";
            break;
        case 5:
            returnDayStr = "금요일";
            break;
        case 6:
            returnDayStr = "토요일";
            break;
    }
    return returnDayStr;
}

function playYoutube(connection, message) {
    let server = servers[message.guild.id];

    if (server.queue.length == 0) {
        disconnectWithMessage(connection, message);
        return;
    }

    server.dispatcher = connection.playStream(YTDL(server.queue[0].videoUrl, { quality: "highestaudio", filter: "audioonly" }))
    .on("end", function (check) {
        if (server.queue[0]) {
            if (check) {
                message.channel.send(server.queue[0].videoTitle + "를(을) 스킵하였습니다.");
            } else {
                message.channel.send(server.queue[0].videoTitle + "를(을) 재생하였습니다.");
            }
            server.dispatcher.destory();
            server.queue.shift();
            playYoutube(connection, message);
        } else {
            disconnectWithMessage(connection, message);
        }
    });
    message.channel.send(server.queue[0].videoTitle + "를(을) 재생중입니다.\n재생시간 : " + server.queue[0].videoTime);
    server.queue[0].videoState = true;
}

function disconnectWithMessage(connection, message) {
    message.channel.send("노래 재생이 종료되었습니다.");
    connection.disconnect();
}

client.on("ready", () => {
    console.log(`Server Ready - now Runing: ${process.env.NODE_ENV != undefined ? process.env.NODE_ENV : "dev"}`);

    //servers 초기화
    client.guilds.forEach((value, index) => {
        servers[index] = {
            queue: []
        }
    });
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel;
    let oldUserChannel = oldMember.voiceChannel;

    if(oldUserChannel === undefined && newUserChannel !== undefined) {
        customTool.voiceLogRecorder("'" + newUserChannel.name + "' 채널에 '" + newMember.nickname + "' 님이 들어옴 time: " + new Date());
    } else if(newUserChannel === undefined){
        customTool.voiceLogRecorder("'" + oldUserChannel.name + "' 채널에 '" + oldMember.nickname + "' 님이 나감 time: " + new Date());
    }
});


client.on("message", message => {

    if (message.member.user.bot) return;

    let args = message.content.split(" ");

    switch (args[0].toLowerCase()) {
        /*
        20190622
        해당 유투브 영상 재생 기능은 특정 이용자에 대한 소리끊김과 퀄리티 저하로 인해
        추후 수정될 예정
        */
        case "!재생": {
            if (permission(message)) return;

            if (!args[1]) {
                message.channel.send("!재생 <유툽주소> ㄱㄱ");
                return;
            }

            if (!message.member.voiceChannel) {
                message.channel.send("방에 들어가야지 노래를 들려주징;;");
                return;
            }

            if (!servers[message.guild.id]) {
                servers[message.guild.id] = {
                    queue: []
                }
            } 

            let server = servers[message.guild.id];

            if (server.queue.length > 5) {
                message.channel.send("대기열은 최대 5개까지만 등록이 가능합니다.");
                return;
            }

            message.channel.send("로딩중......").then((editMsg)=> {
                YTDL.getInfo(args[1], function(err, info) {
                    if(err) {
                        editMsg.edit("잘못된 주소거나 영상이 존재하지 않습니다.");
                        return;
                    }

                    let videoLength = info.player_response.videoDetails.lengthSeconds;
                    let videoHour = (videoLength / 3600).toFixed(0);
                    let videoMinute = (videoLength / 60).toFixed(0);
                    let videoSecond = (videoLength % 60).toFixed(0);
        
                    videoHour = videoHour > 9 ? videoHour : "0" + videoHour;
                    videoMinute = videoMinute > 9 ? videoMinute : "0" + videoMinute;
                    videoSecond = videoSecond > 9 ? videoSecond : "0" + videoSecond;

                    let videoData = {
                        videoUrl : args[1],
                        videoTime : videoHour + ":" + videoMinute + ":" + videoSecond,
                        videoTitle : info.player_response.videoDetails.title,
                        videoState : false
                    }

                    server.queue.push(videoData);

                    editMsg.edit(info.player_response.videoDetails.title + "가 추가되었습니다.");

                    if (!message.guild.voiceConnection)  {
                        message.member.voiceChannel.join().then(function (connection) {
                            playYoutube(connection, message);
                        });
                    }
                });
            });

            break;
        }
        case "!소리": {
            if (permission(message)) return;

            let volumeControlData = 0.2;
            let volumeControlMin = 0;
            let volumeControlMax = 2;

            if (!args[1]) {
                message.channel.send("!소리 <증가, 감소, 초기화> ㄱㄱ");
                return;
            }

            let server = servers[message.guild.id];
            
            if (!(server && server.dispatcher)) {
                message.channel.send("플레이어를 아직 사용하지 않았습니다.");
                return;
            }

            if (args[1] == "증가") {
                if (server.dispatcher.volume < volumeControlMax) {
                    server.dispatcher.setVolume(server.dispatcher.volume + volumeControlData);
                    message.channel.send("소리가 증가되었습니다.");
                } else {
                    server.dispatcher.setVolume(volumeControlMax);
                    message.channel.send("더이상 조절할 수 있는 볼륨 단계가 없습니다.");
                }
            } else if (args[1] == "감소") {
                if (server.dispatcher.volume > volumeControlMin) {
                    server.dispatcher.setVolume(server.dispatcher.volume - volumeControlData);
                    message.channel.send("소리가 감소되었습니다.");
                } else {
                    server.dispatcher.setVolume(volumeControlMin);
                    message.channel.send("더이상 조절할 수 있는 볼륨 단계가 없습니다.");
                }
            } else if (args[1] == "초기화") {
                server.dispatcher.setVolume(1);
                message.channel.send("소리가 초기화되었습니다.");
            }
            message.channel.send("현재 소리 크기 : " + (server.dispatcher.volume / volumeControlMax * 100).toFixed(0) + "%");
            break;
        }
        case "!일시정지": {
            if (permission(message)) return;

            let server = servers[message.guild.id];
            
            if (!(server && server.dispatcher)) {
                message.channel.send("플레이어를 아직 사용하지 않았습니다.");
                return;
            }

            if (server.dispatcher.paused) {
                server.dispatcher.resume();
                message.channel.send("노래가 다시 재생됩니다.");
            } else {
                server.dispatcher.pause();
                message.channel.send("노래가 일시정지합니다.");
            }
 
            break;
        }
        case "!스킵": {
            if (permission(message)) return;

            let server = servers[message.guild.id];

            if (server && server.dispatcher) {
                server.dispatcher.end(1);
            }

            break;
        }
        case "!목록": {
            if (permission(message)) return;

            let server = servers[message.guild.id];

            if (!server) {
                message.channel.send("현재 재생 대기열이 없습니다.");
                return;
            }
           
            if (server.queue.length > 0) {
                let videoArr = [];

                server.queue.forEach(function(element, index){
                    videoArr.push({name: (index + 1) + "순위" + ((element.videoState == true) ? " - (현재 재생중)" : "") , value: element.videoTitle + " / " + element.videoTime});
                });

                message.channel.send({
                    embed: {
                        color: 3447003,
                        title: "재생 목록",
                        fields: videoArr
                    }
                });
            } else {
                message.channel.send("현재 재생 대기열이 없습니다.");
            }

            break;
        }
        case "!종료": {
            if (permission(message)) return;

            let server = servers[message.guild.id];

            if (server) server.queue = [];

            if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
            break;
        }
        case "!롤": {
            if (permission(message)) return;

            if (message.content.length < 3) {
                message.channel.send("!롤 <닉네임> ㄱㄱ");
                return;
            }

            let nickname = message.content.substring(3, message.content.length).trim();

            customGame.searchLOLPlayerData(message, nickname, httppas);

            break;
        }
        case "!희건": {
            let nowDate = new Date();
            let countParameter = args[1];
            let printDataArr = [];
            let checkParameterType = false;

            if (countParameter === undefined) {
                countParameter = 1;
            } else if (isNaN(Number(countParameter))) {
                countParameter = -1;
            } else {
                countParameter = Number(countParameter);
            }

            if(datePattern.test(countParameter)) {
                checkParameterType = true;
            }

            if (hgunDay == null) {
                message.channel.send({
                    embed: {
                        color: 3447003,
                        title: "희Gun이 상태",
                        description: "쉬는날 파일을 불러올수 없습니다."
                    }
                });
                return;
            }
            
            //checkParameterType == true == 날짜 검색
            //checkParameterType == false == 당일로부터 몇일 뒤 검색
            if (checkParameterType) {
                let parameterToDate = new Date(args[1].substring(0,4), Number(args[1].substring(4,6)) -1, args[1].substring(6,8), 0, 0, 0);

                let printData = "";
                switch (heGunHoliData(parameterToDate)) {
                    case 1:
                        printData = "쉬는날";
                        break;
                    case 2:
                        printData = "주간";
                        break;
                    case 3:
                        printData = "야간";
                        break;
                    case -1:
                        printData = "정보가 없습니다.";
                        break;
                }
                let printStr = parameterToDate.getFullYear() + "-" + ((parameterToDate.getMonth() + 1) > 9 ? (parameterToDate.getMonth() + 1) : "0" + (parameterToDate.getMonth() + 1)) + "-" + (parameterToDate.getDate() > 9 ? parameterToDate.getDate() : "0" + parameterToDate.getDate()) + " " + getWeekOfDay(parameterToDate.getDay());
                printDataArr.push({name: printStr, value: printData});
            } else {
                if (countParameter > 7) {
                    message.channel.send({
                        embed: {
                            color: 3447003,
                            title: "희Gun이 상태",
                            description: "!희건 <조회할 날짜(YYYYMMDD)>\n명령어를 올바르게 기입해주세요."
                        }
                    });
                    return;
                }

                if (countParameter < 1) {
                    message.channel.send({
                        embed: {
                            color: 3447003,
                            title: "희Gun이 상태",
                            description: "!희건 <오늘 부터 조회할 날짜 수> 또는 <조회할 날짜(YYYYMMDD)>\n명령어를 올바르게 기입해주세요."
                        }
                    });
                    return;
                }

                if (7 < countParameter) {
                    message.channel.send({
                        embed: {
                            color: 3447003,
                            title: "희Gun이 상태",
                            description: "조회할 날짜 수 범위를 지켜주세요. (1 ~ 7)"
                        }
                    });
                    return;
                }

                for (let i = 0; i < countParameter; i++) {
                    let printData = "";
                    switch (heGunHoliData(nowDate)) {
                        case 1:
                            printData = "쉬는날";
                            break;
                        case 2:
                            printData = "주간";
                            break;
                        case 3:
                            printData = "야간";
                            break;
                        case -1:
                            printData = "정보가 없습니다.";
                            break;
                    }
                    let printStr = nowDate.getFullYear() + "-" + ((nowDate.getMonth() + 1) > 9 ? (nowDate.getMonth() + 1) : "0" + (nowDate.getMonth() + 1)) + "-" + (nowDate.getDate() > 9 ? nowDate.getDate() : "0" + nowDate.getDate()) + " " + getWeekOfDay(nowDate.getDay());
                    printDataArr.push({name: printStr, value: printData});
                    nowDate.setDate(nowDate.getDate() + 1);
                }
            }

            message.channel.send({
                embed: {
                    color: 3447003,
                    title: "희Gun이 상태",
                    fields: printDataArr
                }
            });
            break;
        }
        case "!날씨": {
            customTool.parseSeoulWeather(message, xmlConvert, httppas);
            break;
        }
        case "!메이플": {
            if (message.content.length < 3) {
                message.channel.send("!메이플 <닉네임> ㄱㄱ");
                return;
            }

            let nickname = encodeURIComponent(message.content.substring(5, message.content.length).trim());

            customGame.searchMaplePlayerData(message, nickname, 0, httppas, Discord);

            break;
        }
        case "!타이머": {
            if (permission(message)) return;
            if (message.content.length < 3 || isNaN(args[1]) || args.length < 4 || message.content.indexOf("\"") == -1) {
                message.channel.send("!타이머 <분> <호출대상> \"<문구>\"ㄱㄱ");
                return;
            }

            if (args[1] > 1440 || 1 > args[1]) {
                message.channel.send("최소 1 ~ 1440분 까지 사용할 수 있습니다.");
                return;
            }

            let serverMembers = message.guild.members.filter(member => member.user.bot === false);
            let callUsers = [];

            let sendMembers = "호출대상 :";
            let sendText = message.content.substring(message.content.indexOf("\"") + 1, message.content.lastIndexOf("\""));

            serverMembers.forEach(function (member) {
                let matchMember = member.nickname != null ? member.nickname : member.user.username;

                if (matchMember.indexOf(args[2]) != -1) {
                    sendMembers += matchMember + ", ";
                    callUsers.push(member.user.id);
                }
            });

            if (callUsers.length > 0) {
                let printDataArr = [];

                printDataArr.push({name: "타이머 호출대상", value: sendMembers});
                printDataArr.push({name: "타이머 시간", value:  args[1] + "분"});
                printDataArr.push({name: "타이머 취소 방법", value: "!타이머취소 " + (timerQueue.length + 1)});

                message.channel.send({
                    embed: {
                        color: 3447003,
                        fields: printDataArr
                    }
                });

                let timerObj = new Object();
                let callUserStr = "";

                callUsers.forEach(function (id) {
                    callUserStr += " <@!" + id + ">";
                });

                timerObj.timer = setTimeout(function () {
                    message.channel.send(sendText + callUserStr);
                    timerQueue.forEach(function (timeSch, idx) {
                        if(timeSch.timer._called) {
                            clearTimeout(timeSch.timer);
                            timerQueue.splice(idx, 1);
                        }
                    });
                }, args[1] * 60 * 1000);

                timerObj.owner = message.member.user.id;
                timerObj.rank =  timerQueue.length + 1;

                timerQueue.push(timerObj);
            } else {
                message.channel.send("호출 대상의 이름을 확인한 후 다시 입력해주세요!");
            }
            break;
        }
        case "!타이머취소": {
            if (permission(message)) return;
            
            if (message.content.length < 5 || args.length < 2 || isNaN(args[1])) {
                message.channel.send("!타이머취소 <타이머 번호> ㄱㄱ");
                return;
            }

            timerQueue.forEach(function (timeSch, idx) {
                if(timeSch.rank == args[1]) {
                    if (timeSch.owner != message.member.user.id) {
                        message.channel.send("타이머는 생성한 사람만 삭제할 수 있습니다.");
                        return;
                    }
                    clearTimeout(timeSch.timer);
                    timerQueue.splice(idx, 1);
                    message.channel.send("타이머가 취소되었습니다.");
                }
            });
            break;
        }
        case "!상태": {
            let cpuTemper, gpuTemper;
            exec("vcgencmd measure_temp", (err, stdout, stderr) => {
                if (err || stderr) {
                    return;
                }
                gpuTemper = stdout.substring(5);
                exec("cat /sys/class/thermal/thermal_zone0/temp", (err, stdout, stderr) => {
                    if (err || stderr) {
                        return;
                    }
                    cpuTemper = (stdout / 1000).toFixed(1) + "'C";

                    let printDataArr = [];

                    printDataArr.push({name: "Cpu 온도", value: cpuTemper});
                    printDataArr.push({name: "Gpu 온도", value: gpuTemper});

                    message.channel.send({
                        embed: {
                            color: 3447003,
                            fields: printDataArr
                        }
                    });
                });
            });
            break;
        }
        case "!엔화": {
            customTool.exchangeWonToJpy(message, httppas);
            break;
        }
        case "!명령어": {
            let printDataArr = [];

            printDataArr.push({name: "!롤 <닉네임>", value: "롤전적 검색"});
            printDataArr.push({name: "!희건 <오늘 부터 조회할 날짜 수> 또는 <조회하고 싶은 당일 (YYYYMMDD)>", value: "오늘이 야간,주간,휴일 인지 조회"});
            printDataArr.push({name: "!메이플 <닉네임>", value: "메이플 정보 검색"});
            printDataArr.push({name: "!날씨", value: "서울시 날씨 데이터를 조회"});
            printDataArr.push({name: "!타이머 <분> <호출대상> \"<문구>\"", value: "호출대상을 지정하고 입력하면 입력한 시간에 따라 이용자 호출"});
            printDataArr.push({name: "!타이머취소 <타이머코드>", value: "타이머취소 방법"});
            printDataArr.push({name: "!엔화", value: "엔화 가격 조회"});

            message.channel.send({
                embed: {
                    color: 3447003,
                    fields: printDataArr
                }
            });
            break;
        }
        default: {
            break;
        }
    }
});

client.login(process.env.DISCORD_API_KEY);
