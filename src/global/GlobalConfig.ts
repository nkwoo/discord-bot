export interface GlobalConfig {
    apiKey: {
        discord: string,
        naver: {
            papago: {
                detectLang: {
                    clientId: string,
                    clientSecret: string
                },
                nmt: {
                    clientId: string,
                    clientSecret: string
                }
            }
        },
        lol: string
    },
    administratorId: string[],
    botDevId: string,
    version: string
}