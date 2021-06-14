import {Connection} from "typeorm";
import {KnouNoticeRepository} from "../repository/KnouNoticeRepository";
import {KnouNoticeEntity} from "../entity/domain/KnouNoticeEntity";
import {KnouNoticeDomain} from "../entity/KnouNoticeDomain";

export class KnouNoticeService {

    constructor(private connection: Connection) {
    }

    async getUnNotifyNotices(): Promise<KnouNoticeEntity[]> {
        return await this.connection.getCustomRepository(KnouNoticeRepository)
            .createQueryBuilder("notice")
            .select()
            .where("notice.IS_NOTIFY = :notify")
            .setParameter("notify", 0)
            .orderBy("notice.BOARD_IDX")
            .getMany();
    }

    async updateNotifyNotices(entities: KnouNoticeEntity[]): Promise<void> {
        const knouNoticeRepository = this.connection.getCustomRepository(KnouNoticeRepository);

        entities.forEach(value => value.isNotify = true);

        await knouNoticeRepository.save(entities);
    }

    async upsertNotice(domainDtoArray: KnouNoticeDomain[]): Promise<void> {
        await domainDtoArray.forEach(domainDto => {
             this.connection.createQueryBuilder()
                .insert()
                .into(KnouNoticeEntity)
                .values({
                    boardIdx: domainDto.boardIdx,
                    title: domainDto.title,
                    writeDate: domainDto.writeDate,
                    postLink: domainDto.postLink
                })
                .orUpdate({
                    conflict_target: ["BOARD_IDX"],
                    overwrite: ["TITLE", "WRITE_DT", "POST_LINK"]
                })
                .execute()
                .catch(reason => {
                    console.log(reason);
                    return false;
                });
        });
    }
}