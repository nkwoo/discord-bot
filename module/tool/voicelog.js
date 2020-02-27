const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');
const moment = require('moment');   //한국시간을 나타내기 위한 모듈 추가
const logDir = 'voicelog/';
const fs = require('fs');

function timeStampFormat() {
    return moment().format("YYYY-MM-DD HH:mm:ss");
}

export function voiceLogRecorder (info) {
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    var logger = winston.createLogger({
        transports: [
            new (winstonDaily)({
                level: 'info',
                filename: './voicelog/vlog-%DATE%.log',
                datePatten: 'YYYY-MM-DD',
                prepend: true,
                timestamp: timeStampFormat
            })
        ]
    });

    try {
        logger.info(info);
    } catch(exception) {
        logger.error("ERROR => " +exception);
    }
}