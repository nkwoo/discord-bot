import {EntityRepository, Repository} from "typeorm";
import {VoiceLogEntity} from "../entity/domain/VoiceLogEntity";

@EntityRepository(VoiceLogEntity)
export class VoiceLogRepository extends Repository<VoiceLogEntity> {
}