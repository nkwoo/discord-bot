import * as cron from "node-cron";
import {ScheduledTask} from "node-cron";
import {KnouNoticeService} from "../database/service/KnouNoticeService";
import {Tool} from "./Tool";
import {Connection} from "typeorm";
import {TextChannel} from "discord.js";
import {logger} from "./Winston";

export class Schedule {
    private knouNoticeNotifyCron: ScheduledTask;

    private knouNoticeService: KnouNoticeService;

    constructor(private connection: Connection, private tool: Tool) {
        this.knouNoticeService = new KnouNoticeService(connection);
    }

    init(knouTextChannelList: TextChannel[]): void {
        this.knouNoticeNotifyCron = cron.schedule("0 0 1,7,13,19 * * *", async () => {

            const knouNoticeEntities = await this.knouNoticeService.getUnNotifyNotices();

            if (knouNoticeEntities.length > 0) {
                logger.info(`Notify Update - ${knouNoticeEntities.length} Change Row`);

                knouNoticeEntities.forEach(notice => {
                    knouTextChannelList.forEach(channel => {
                        this.tool.knou.sendNotice(channel, notice).catch(reason => channel.send(reason));
                    });
                });

                await this.knouNoticeService.updateNotifyNotices(knouNoticeEntities);
            }

            this.tool.knou.getNoticeData().then(noticeDtoArray =>  this.knouNoticeService.upsertNotice(noticeDtoArray));

        }, {
            scheduled: false
        });
        logger.info("Schedule Init");
    }

    start(): void {
        this.knouNoticeNotifyCron.start();
        logger.info("Schedule Start");
    }

    stop(): void {
        this.knouNoticeNotifyCron.stop();
    }
}