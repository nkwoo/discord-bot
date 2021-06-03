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
        this.knouNoticeNotifyCron = cron.schedule("* * 1,7,13,19 * * *", async () => {
            await this.tool.knou.getNoticeData().then(noticeDtoArray =>  this.knouNoticeService.upsertNotice(noticeDtoArray));

            const knouNoticeEntities = await this.knouNoticeService.getUnNotifyNotices().then();

            knouNoticeEntities.forEach(notice => {
                knouTextChannelList.forEach(channel => {
                    this.tool.knou.sendNotice(channel, notice).then(() => this.knouNoticeService.updateNotifyNotice(notice));
                });
                logger.info(`Update Notify Row : ${knouNoticeEntities.length} Change`);
            });
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