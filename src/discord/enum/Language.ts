export enum Language {
    KO = "ko", // 한국어
    JA = "ja", // 일본어
    ZHCN = "zh-CN", // 중국어 간체
    ZHTW = "zh-TW", // 중국어 번체
    HI = "hi", // 힌디어
    EN = "en", // 영어
    ES = "es", // 스페인어
    FR = "fr", // 프랑스어
    DE = "de", // 독일어
    PT = "pt", // 포르투갈어
    VI = "vi", // 베트남어
    ID = "id", // 인도네시아어
    FA = "fa", // 페르시아어
    AR = "ar", // 아랍어
    MM = "mm", // 미얀마어
    TH = "th", // 태국어
    RU = "ru", // 러시아어
    IT = "it", // 이탈리아어
    KNOWN = "unk" // 알수 없는 언어
}

export function getLanguage(lang: string): Language {
    switch (lang) {
        case "ko":
            return Language.KO;
        case "ja":
            return Language.JA;
        case "zh-cn":   // 파파고 언어 감지
        case "zh-CN":   // 파파고 번역 API 돌릴시
            return Language.ZHCN;
        case "zh-tw":   // 파파고 언어 감지
        case "zh-TW":   // 파파고 번역 API 돌릴시
            return Language.ZHTW;
        case "hi":
            return Language.HI;
        case "en":
            return Language.EN;
        case "es":
            return Language.ES;
        case "fr":
            return Language.FR;
        case "de":
            return Language.DE;
        case "pt":
            return Language.PT;
        case "vi":
            return Language.VI;
        case "id":
            return Language.ID;
        case "fa":
            return Language.FA;
        case "ar":
            return Language.AR;
        case "mm":
            return Language.MM;
        case "th":
            return Language.TH;
        case "ru":
            return Language.RU;
        case "it":
            return Language.IT;
        default:
            return Language.KNOWN;
    }
}

export function getLanguageKorean(lang: string): string {
    switch (lang) {
        case "ko":
            return "한국어";
        case "ja":
            return "일본어";
        case "zh-cn":   // 파파고 언어 감지
        case "zh-CN":   // 파파고 번역 API 돌릴시
            return "중국어 간체";
        case "zh-tw":   // 파파고 언어 감지
        case "zh-TW":   // 파파고 번역 API 돌릴시
            return "중국어 번체";
        case "hi":
            return "힌디어";
        case "en":
            return "영어";
        case "es":
            return "스페인어";
        case "fr":
            return "프랑스어";
        case "de":
            return "독일어";
        case "pt":
            return "포르투갈어";
        case "vi":
            return "베트남어";
        case "id":
            return "인도네이사어";
        case "fa":
            return "페르시아어";
        case "ar":
            return "아랍어";
        case "mm":
            return "미얀마어";
        case "th":
            return "태국어";
        case "ru":
            return "러시아어";
        case "it":
            return "이탈리아어";
        default:
            return "알수없어";
    }
}