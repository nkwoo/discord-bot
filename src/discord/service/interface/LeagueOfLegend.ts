import {LeagueOfLegendUserDto} from "../../dto/LeagueOfLegendUserDto";
import {LeagueOfLegendRotationDto} from "../../dto/LeagueOfLegendRotationDto";
import {ErrorDto} from "../../dto/ErrorDto";

export interface LeagueOfLegend {
    searchLoLPlayData(nickname: string): Promise<LeagueOfLegendUserDto | ErrorDto | undefined>;
    getRotationsChampion(): Promise<LeagueOfLegendRotationDto | ErrorDto | undefined>;
}