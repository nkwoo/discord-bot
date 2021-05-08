import {EntityRepository, Repository} from "typeorm";
import {KnouNoticeEntity} from "../entity/domain/KnouNoticeEntity";

@EntityRepository(KnouNoticeEntity)
export class KnouNoticeRepository extends Repository<KnouNoticeEntity> {
}