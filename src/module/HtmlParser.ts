import * as axios from "axios";
import { load } from "cheerio";
//axios cache
import { cacheAdapterEnhancer } from "axios-extensions";
import { AxiosAdapter } from "axios";
import Root = cheerio.Root;
import querystring from "querystring";
//https://yamoo9.github.io/axios/guide/error-handling.html

export class HtmlParser {
    async getHtmlDocument(url: string) {
        try {
            return await axios.default.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36",
                    "Content-Type": "text/html",
                    "Cache-Control": "no-cache"
                },
                adapter: cacheAdapterEnhancer(<AxiosAdapter>axios.default.defaults.adapter, { enabledByDefault: false }),
                validateStatus: function (status) {
                    return status < 500;
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    async getHtmlDocumentParameter(url: string, parameterJson: any = {}) {
        try {
            return await axios.default.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36",
                    "Content-Type": "text/html"
                },
                params: parameterJson,
                validateStatus: function (status) {
                    return status < 500;
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    async getPostJson<T>(url: string, headerJson: any = {}, parameterJson: any = {}) {
        try {
            return await axios.default.post<T>(url, querystring.stringify(parameterJson), {
                headers: headerJson,
                validateStatus: function (status: number) {
                    return status < 500;
                }
            }).catch(error => {
                console.log(error);
            });
        } catch (error) {
            console.error(error);
        }
    }

    changeHtmlToDom(html: string): Root {
        return load(html);
    }
}