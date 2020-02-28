"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _discord = require("discord.js");

var Discord = _interopRequireWildcard(_discord);

var _ytdlCore = require("ytdl-core");

var YTDL = _interopRequireWildcard(_ytdlCore);

var _cheerioHttpcli = require("cheerio-httpcli");

var httpcli = _interopRequireWildcard(_cheerioHttpcli);

var _xmlJs = require("xml-js");

var xmlConvert = _interopRequireWildcard(_xmlJs);

var _dotenv = require("dotenv");

var dotenv = _interopRequireWildcard(_dotenv);

var _fs = require("fs");

var fs = _interopRequireWildcard(_fs);

var _child_process = require("child_process");

var exec = _interopRequireWildcard(_child_process);

var _game = require("./module/game");

var customGame = _interopRequireWildcard(_game);

var _tool = require("./module/tool");

var customTool = _interopRequireWildcard(_tool);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var client = new Discord.Client();

var weekOfDayArray = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

var servers = {};
var timerQueue = [];

var administratorUserId = ["356423613605478401"];
var botDevId = "682174735169486868";

var envPath = void 0;
switch (process.env.NODE_ENV) {
    case "prod":
        envPath = "./.env.prod";
        break;
    case "dev":
        envPath = "./.env.dev";
        break;
    default:
        envPath = "./.env.dev";
        break;
}

var envConfig = dotenv.parse(fs.readFileSync(envPath));
for (var k in envConfig) {
    process.env[k] = envConfig[k];
}

//날짜 정규식
var datePattern = /^(19|20)\d{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[0-1])$/;

/**
* 유저 권한 체크
*/
function permission(message) {
    var id = message.member.user.id;
    for (var i = 0; i < administratorUserId.length; i++) {
        if (administratorUserId[i] == id) return false;
    }
    message.channel.send("permission denied");
    return true;
}

/**
 * Date To String
 */
function dateToString(date, selector, option) {
    if ((typeof date === "undefined" ? "undefined" : _typeof(date)) == Date) {
        if (option == "YYYYMMDDHH24MISS") {
            return date.getFullYear() + selector + (date.getMonth() + 1 > 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) + selector + (date.getDate() > 9 ? date.getDate() : "0" + date.getDate()) + " " + (date.getHours() > 9 ? date.getHours() : "0" + date.getHours()) + ":" + (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinute()) + ":" + (date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds());
        } else if (option == "YYYYMMDD") {
            return date.getFullYear() + selector + (date.getMonth() + 1 > 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) + selector + (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
        }
    } else {
        return "1970" + selector + "01" + selector + "01";
    }
}

function playYoutube(connection, message) {
    var server = servers[message.guild.id];

    if (server.queue.length == 0) {
        disconnectWithMessage(connection, message);
        return;
    }

    server.dispatcher = connection.playStream(YTDL(server.queue[0].videoUrl, { quality: "highestaudio", filter: "audioonly" })).on("end", function (check) {
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

client.on("ready", function () {
    console.log("Server Ready - now Runing: " + (process.env.NODE_ENV != undefined ? process.env.NODE_ENV : "dev"));

    client.guilds.forEach(function (value, index) {
        servers[index] = {
            queue: []
        };
    });
});

client.on('voiceStateUpdate', function (oldMember, newMember) {
    var newUserChannel = newMember.voiceChannel;
    var oldUserChannel = oldMember.voiceChannel;

    //로그는 서버/채널/닉네임 순

    if (oldUserChannel === undefined) {
        customTool.voiceLogRecorder(newUserChannel.guild.name + "/" + newUserChannel.name + "/" + newMember.nickname + "\uB2D8 \uC785\uC7A5");
    } else if (newUserChannel === undefined) {
        customTool.voiceLogRecorder(oldUserChannel.guild.name + "'/'" + oldUserChannel.name + "/" + oldMember.nickname + "\uB2D8 \uD1F4\uC7A5");
    } else if (oldUserChannel != undefined && newUserChannel != undefined) {
        customTool.voiceLogRecorder(oldUserChannel.guild.name + "'/'" + oldUserChannel.name + "/" + oldMember.nickname + "' \uC5D0\uC11C '" + newUserChannel.guild.name + "'\uC11C\uBC84 '" + newUserChannel.name + "' \uCC44\uB110\uC5D0 '" + newMember.nickname + "'\uB85C \uC774\uB3D9\uD568");
    }
});

client.on("message", function (message) {

    if (message.member.user.bot) return;

    var args = message.content.split(" ");

    if (process.env.NODE_ENV == "prod") {
        var checkDevOn = message.guild.members.filter(function (el) {
            return el.user.id == botDevId && el.user.presence.status == "online";
        }).array().length;

        if (checkDevOn > 0) {
            return;
        }
    }

    switch (args[0].toLowerCase()) {
        /*
        20190622
        해당 유투브 영상 재생 기능은 특정 이용자에 대한 소리끊김과 퀄리티 저하로 인해
        추후 수정될 예정
        */
        case "!재생":
            {
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
                    };
                }

                var server = servers[message.guild.id];

                if (server.queue.length > 5) {
                    message.channel.send("대기열은 최대 5개까지만 등록이 가능합니다.");
                    return;
                }

                message.channel.send("로딩중......").then(function (editMsg) {
                    YTDL.getInfo(args[1], function (err, info) {
                        if (err) {
                            editMsg.edit("잘못된 주소거나 영상이 존재하지 않습니다.");
                            return;
                        }

                        var videoLength = info.player_response.videoDetails.lengthSeconds;
                        var videoHour = (videoLength / 3600).toFixed(0);
                        var videoMinute = (videoLength / 60).toFixed(0);
                        var videoSecond = (videoLength % 60).toFixed(0);

                        videoHour = videoHour > 9 ? videoHour : "0" + videoHour;
                        videoMinute = videoMinute > 9 ? videoMinute : "0" + videoMinute;
                        videoSecond = videoSecond > 9 ? videoSecond : "0" + videoSecond;

                        var videoData = {
                            videoUrl: args[1],
                            videoTime: videoHour + ":" + videoMinute + ":" + videoSecond,
                            videoTitle: info.player_response.videoDetails.title,
                            videoState: false
                        };

                        server.queue.push(videoData);

                        editMsg.edit(info.player_response.videoDetails.title + "가 추가되었습니다.");

                        if (!message.guild.voiceConnection) {
                            message.member.voiceChannel.join().then(function (connection) {
                                playYoutube(connection, message);
                            });
                        }
                    });
                });

                break;
            }
        case "!소리":
            {
                if (permission(message)) return;

                var volumeControlData = 0.2;
                var volumeControlMin = 0;
                var volumeControlMax = 2;

                if (!args[1]) {
                    message.channel.send("!소리 <증가, 감소, 초기화> ㄱㄱ");
                    return;
                }

                var _server = servers[message.guild.id];

                if (!(_server && _server.dispatcher)) {
                    message.channel.send("플레이어를 아직 사용하지 않았습니다.");
                    return;
                }

                if (args[1] == "증가") {
                    if (_server.dispatcher.volume < volumeControlMax) {
                        _server.dispatcher.setVolume(_server.dispatcher.volume + volumeControlData);
                        message.channel.send("소리가 증가되었습니다.");
                    } else {
                        _server.dispatcher.setVolume(volumeControlMax);
                        message.channel.send("더이상 조절할 수 있는 볼륨 단계가 없습니다.");
                    }
                } else if (args[1] == "감소") {
                    if (_server.dispatcher.volume > volumeControlMin) {
                        _server.dispatcher.setVolume(_server.dispatcher.volume - volumeControlData);
                        message.channel.send("소리가 감소되었습니다.");
                    } else {
                        _server.dispatcher.setVolume(volumeControlMin);
                        message.channel.send("더이상 조절할 수 있는 볼륨 단계가 없습니다.");
                    }
                } else if (args[1] == "초기화") {
                    _server.dispatcher.setVolume(1);
                    message.channel.send("소리가 초기화되었습니다.");
                }
                message.channel.send("현재 소리 크기 : " + (_server.dispatcher.volume / volumeControlMax * 100).toFixed(0) + "%");
                break;
            }
        case "!일시정지":
            {
                if (permission(message)) return;

                var _server2 = servers[message.guild.id];

                if (!(_server2 && _server2.dispatcher)) {
                    message.channel.send("플레이어를 아직 사용하지 않았습니다.");
                    return;
                }

                if (_server2.dispatcher.paused) {
                    _server2.dispatcher.resume();
                    message.channel.send("노래가 다시 재생됩니다.");
                } else {
                    _server2.dispatcher.pause();
                    message.channel.send("노래가 일시정지합니다.");
                }

                break;
            }
        case "!스킵":
            {
                if (permission(message)) return;

                var _server3 = servers[message.guild.id];

                if (_server3 && _server3.dispatcher) {
                    _server3.dispatcher.end(1);
                }

                break;
            }
        case "!목록":
            {
                if (permission(message)) return;

                var _server4 = servers[message.guild.id];

                if (!_server4) {
                    message.channel.send("현재 재생 대기열이 없습니다.");
                    return;
                }

                if (_server4.queue.length > 0) {
                    var videoArr = [];

                    _server4.queue.forEach(function (element, index) {
                        videoArr.push({ name: index + 1 + "순위" + (element.videoState == true ? " - (현재 재생중)" : ""), value: element.videoTitle + " / " + element.videoTime });
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
        case "!종료":
            {
                if (permission(message)) return;

                var _server5 = servers[message.guild.id];

                if (_server5) _server5.queue = [];

                if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
                break;
            }
        case "!롤":
            {
                if (permission(message)) return;

                if (message.content.length < 3) {
                    message.channel.send("!롤 <닉네임> ㄱㄱ");
                    return;
                }

                var nickname = message.content.substring(3, message.content.length).trim();

                customGame.searchLOLPlayerData(message, nickname, httpcli);

                break;
            }
        case "!희건":
            {
                var nowDate = new Date();
                var countParameter = args[1];
                var printDataArr = [];
                var checkParameterType = false;

                if (countParameter === undefined) {
                    countParameter = 1;
                } else if (isNaN(Number(countParameter))) {
                    countParameter = -1;
                } else {
                    countParameter = Number(countParameter);
                }

                if (datePattern.test(countParameter)) {
                    checkParameterType = true;
                }

                if (!customTool.heeKunHolidayfileExist()) {
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
                    var parameterToDate = new Date(args[1].substring(0, 4), Number(args[1].substring(4, 6)) - 1, args[1].substring(6, 8), 0, 0, 0);

                    printDataArr.push({
                        name: dateToString(parameterToDate, "-", "YYYYMMDD") + " " + weekOfDayArray[parameterToDate.getDay()],
                        value: customTool.heeKunHoliday(parameterToDate).name
                    });
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

                    for (var i = 0; i < countParameter; i++) {

                        printDataArr.push({
                            name: dateToString(nowDate, "-", "YYYYMMDD") + " " + weekOfDayArray[nowDate.getDay()],
                            value: customTool.heeKunHoliday(nowDate).name
                        });

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
        case "!날씨":
            {
                customTool.parseSeoulWeather(message, xmlConvert, httpcli);
                break;
            }
        case "!메이플":
            {
                if (message.content.length < 3) {
                    message.channel.send("!메이플 <닉네임> ㄱㄱ");
                    return;
                }

                var _nickname = encodeURIComponent(message.content.substring(5, message.content.length).trim());

                customGame.searchMaplePlayerData(message, _nickname, 0, httpcli, Discord);

                break;
            }
        case "!타이머":
            {
                if (permission(message)) return;
                if (message.content.length < 3 || isNaN(args[1]) || args.length < 4 || message.content.indexOf("\"") == -1) {
                    message.channel.send("!타이머 <분> <호출대상> \"<문구>\"ㄱㄱ");
                    return;
                }

                if (args[1] > 1440 || 1 > args[1]) {
                    message.channel.send("최소 1 ~ 1440분 까지 사용할 수 있습니다.");
                    return;
                }

                var serverMembers = message.guild.members.filter(function (member) {
                    return member.user.bot === false;
                });
                var callUsers = [];

                var sendMembers = "호출대상 :";
                var sendText = message.content.substring(message.content.indexOf("\"") + 1, message.content.lastIndexOf("\""));

                serverMembers.forEach(function (member) {
                    var matchMember = member.nickname != null ? member.nickname : member.user.username;

                    if (matchMember.indexOf(args[2]) != -1) {
                        sendMembers += matchMember + ", ";
                        callUsers.push(member.user.id);
                    }
                });

                if (callUsers.length > 0) {
                    var _printDataArr = [];

                    _printDataArr.push({ name: "타이머 호출대상", value: sendMembers });
                    _printDataArr.push({ name: "타이머 시간", value: args[1] + "분" });
                    _printDataArr.push({ name: "타이머 취소 방법", value: "!타이머취소 " + (timerQueue.length + 1) });

                    message.channel.send({
                        embed: {
                            color: 3447003,
                            fields: _printDataArr
                        }
                    });

                    var timerObj = new Object();
                    var callUserStr = "";

                    callUsers.forEach(function (id) {
                        callUserStr += " <@!" + id + ">";
                    });

                    timerObj.timer = setTimeout(function () {
                        message.channel.send(sendText + callUserStr);
                        timerQueue.forEach(function (timeSch, idx) {
                            if (timeSch.timer._called) {
                                clearTimeout(timeSch.timer);
                                timerQueue.splice(idx, 1);
                            }
                        });
                    }, args[1] * 60 * 1000);

                    timerObj.owner = message.member.user.id;
                    timerObj.rank = timerQueue.length + 1;

                    timerQueue.push(timerObj);
                } else {
                    message.channel.send("호출 대상의 이름을 확인한 후 다시 입력해주세요!");
                }
                break;
            }
        case "!타이머취소":
            {
                if (permission(message)) return;

                if (message.content.length < 5 || args.length < 2 || isNaN(args[1])) {
                    message.channel.send("!타이머취소 <타이머 번호> ㄱㄱ");
                    return;
                }

                timerQueue.forEach(function (timeSch, idx) {
                    if (timeSch.rank == args[1]) {
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
        case "!상태":
            {
                var cpuTemper = void 0,
                    gpuTemper = void 0;
                exec("vcgencmd measure_temp", function (err, stdout, stderr) {
                    if (err || stderr) {
                        return;
                    }
                    gpuTemper = stdout.substring(5);
                    exec("cat /sys/class/thermal/thermal_zone0/temp", function (err, stdout, stderr) {
                        if (err || stderr) {
                            return;
                        }
                        cpuTemper = (stdout / 1000).toFixed(1) + "'C";

                        var printDataArr = [];

                        printDataArr.push({ name: "Cpu 온도", value: cpuTemper });
                        printDataArr.push({ name: "Gpu 온도", value: gpuTemper });

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
        case "!엔화":
            {
                customTool.exchangeWonToJpy(message, httpcli);
                break;
            }
        case "!명령어":
            {
                var _printDataArr2 = [];

                _printDataArr2.push({ name: "!롤 <닉네임>", value: "롤전적 검색" });
                _printDataArr2.push({ name: "!희건 <오늘 부터 조회할 날짜 수> 또는 <조회하고 싶은 당일 (YYYYMMDD)>", value: "오늘이 야간,주간,휴일 인지 조회" });
                _printDataArr2.push({ name: "!메이플 <닉네임>", value: "메이플 정보 검색" });
                _printDataArr2.push({ name: "!날씨", value: "서울시 날씨 데이터를 조회" });
                _printDataArr2.push({ name: "!타이머 <분> <호출대상> \"<문구>\"", value: "호출대상을 지정하고 입력하면 입력한 시간에 따라 이용자 호출" });
                _printDataArr2.push({ name: "!타이머취소 <타이머코드>", value: "타이머취소 방법" });
                _printDataArr2.push({ name: "!엔화", value: "엔화 가격 조회" });

                message.channel.send({
                    embed: {
                        color: 3447003,
                        fields: _printDataArr2
                    }
                });
                break;
            }
        default:
            {
                break;
            }
    }
});

if (process.env.DISCORD_API_KEY) {
    client.login(process.env.DISCORD_API_KEY);
} else {
    console.log("You Don't Have Api-Key go https://discordapp.com/developers/applications/");
}