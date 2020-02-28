'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.voiceLogRecorder = voiceLogRecorder;
var winston = require('winston');
var winstonDaily = require('winston-daily-rotate-file');
var logDir = 'voicelog/';
var fs = require('fs');

function voiceLogRecorder(info) {
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    var logger = winston.createLogger({

        format: winston.format.combine(winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }), winston.format.json()),
        transports: [new winstonDaily({
            level: 'info',
            filename: './voicelog/vlog-%DATE%.log',
            datePatten: 'YYYY-MM-DD',
            prepend: true
        })]
    });

    try {
        logger.info(info);
    } catch (exception) {
        logger.error("ERROR => " + exception);
    }
}