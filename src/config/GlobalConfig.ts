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
    connection: {
        host: string,
        port: number,
        username: string,
        password: string,
        database: string,
        logging: boolean
    },
    docker: {
        host: string,
        port: number
    }
    administratorId: string[]
}