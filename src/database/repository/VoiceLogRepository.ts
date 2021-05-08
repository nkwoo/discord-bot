import {EntityRepository, Repository} from "typeorm/index";
import {VoiceLogEntity} from "../entity/domain/VoiceLogEntity";

@EntityRepository(VoiceLogEntity)
export class VoiceLogRepository extends Repository<VoiceLogEntity> {
}