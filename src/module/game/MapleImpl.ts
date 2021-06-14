import {Maple} from "./interface/Maple";
import {HtmlParser} from "../HtmlParser";
import {HttpMethod} from "../../enum/HttpMethod";
import {MapleCharacterDto} from "../../dto/MapleCharacterDto";
import {ErrorDto} from "../../dto/ErrorDto";
import GlobalException from "../../exception/GlobalException";

export class MapleImpl implements Maple {

    constructor(private htmlParser: HtmlParser) {
    }

    async searchMaplePlayerData(nickname: string, serverType = 0): Promise<MapleCharacterDto | ErrorDto | undefined> {
        try {
            const mapleCharacterInfoDom = await this.htmlParser.requestDomData<string>(HttpMethod.GET, `https://maplestory.nexon.com/Ranking/World/Total?c=${nickname}&w=${serverType}`);

            if (mapleCharacterInfoDom === undefined) {
                GlobalException("캐릭터 정보를 가져올 수 없습니다.");
                return;
            }

            const mapleCharacterDto = new MapleCharacterDto();

            const $ = this.htmlParser.changeHtmlToDom(mapleCharacterInfoDom.data);

            $('.search_com_chk > td:nth-child(1) > p:nth-child(1)').each((index, element) => {
                mapleCharacterDto.worldRank = $(element).text().trim();
            });

            $('.search_com_chk > td:nth-child(2) > dl > dt').each((index, element) => {
                mapleCharacterDto.nickname = $(element).text().trim();
            });

            $('.search_com_chk > td:nth-child(2) > dl > dd').each((index, element) => {
                mapleCharacterDto.job = $(element).text().trim();
            });

            $('.search_com_chk > td:nth-child(3)').each((index, element) => {
                mapleCharacterDto.level = $(element).text().trim();
            });

            $('.search_com_chk > td:nth-child(2) > span > img:nth-child(1)').each((index, element) => {
                mapleCharacterDto.thumbnailUrl = $(element)[0].attribs.src;
            });

            if (mapleCharacterDto.worldRank == null || mapleCharacterDto.nickname == null || mapleCharacterDto.job == null) {
                if (serverType == 0) {
                    return await this.searchMaplePlayerData(nickname, 254);
                } else {
                    GlobalException("해당 캐릭터를 찾을 수 없습니다.");
                    return;
                }
            }
            mapleCharacterDto.state = true;
            return mapleCharacterDto;
        } catch (e) {
            return new ErrorDto(e.message);
        }
    }
}