import {VoiceLogType} from "../../enum/VoiceLogType";
import {Connection} from "typeorm/index";
import {VoiceLogRepository} from "../repository/VoiceLogRepository";

export class VoiceLogService {

    constructor(private connection: Connection) {
    }

    async record(serverName: string, channelName: string, userName: string, logType: VoiceLogType, moveChannelName?: string): Promise<void> {
        const voiceLogRepository = this.connection.getCustomRepository(VoiceLogRepository);

        const voiceLog = voiceLogRepository.create();
        voiceLog.server = serverName;
        voiceLog.channel = channelName;
        voiceLog.user = userName;
        voiceLog.type = logType;
        voiceLog.moveChannel = logType === VoiceLogType.MOVE ? moveChannelName : undefined;

        await voiceLogRepository.save(voiceLog);
    }
}