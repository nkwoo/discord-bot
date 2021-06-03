import winston from "winston";
import winstonDaily from 'winston-daily-rotate-file';

const logDir = "logs";

const { combine, timestamp, printf } = winston.format;

const logFormat = printf(info => {
    return `${info.timestamp} | ${info.level.toUpperCase()} | ${info.message}`;
});

const logger = winston.createLogger({
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        logFormat,
    ),
    transports: [
        new winstonDaily({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,
            filename: `%DATE%.log`,
            maxFiles: 20,
            zippedArchive: true,
        }),
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,
            filename: `%DATE%.error.log`,
            maxFiles: 20,
            zippedArchive: true,
        }),
        new winston.transports.Console()
    ]
});

export { logger };