import {VoiceLog} from "./interface/VoiceLog";
import {createLogger, format} from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import * as fs from "fs";

export class VoiceLogImpl implements VoiceLog {

    voiceLogRecorder(info: string): void {
        if (!fs.existsSync("voicelog/")) {
            fs.mkdirSync("voicelog/");
        }

        const logger = createLogger({
            format: format.combine(
                format.timestamp({
                    format: "YYYY-MM-DD HH:mm:ss"
                }),
                format.json()
            ),
            transports: [
                new DailyRotateFile({
                    level: 'info',
                    filename: './voicelog/vlog-%DATE%.log',
                    datePattern: 'YYYY-MM-DD'
                })
            ]
        });

        try {
            logger.info(info);
        } catch(exception) {
            logger.error("ERROR => " +exception);
        }
    }
}