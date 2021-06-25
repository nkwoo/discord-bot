import * as axios from "axios";
import {AxiosAdapter, AxiosRequestConfig, AxiosResponse} from "axios";
import {load} from "cheerio";
//axios cache
import {cacheAdapterEnhancer} from "axios-extensions";
import {HttpMethod} from "../discord/enum/HttpMethod";
import Root = cheerio.Root;

//https://yamoo9.github.io/axios/guide/error-handling.html

export class HtmlParser {
    async requestDomData<T>(method: HttpMethod, url:  string): Promise<AxiosResponse<T> | undefined> {
        const requestHeader = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36",
            "Content-Type": "text/html",
            "Cache-Control": "no-cache"
        };

        return this.requestHeaderParameterData<T>(method, url, requestHeader, {}, cacheAdapterEnhancer(<AxiosAdapter>axios.default.defaults.adapter, { enabledByDefault: false }));
    }

    async requestNoHeaderParameterData<T>(method: HttpMethod, url: string): Promise<AxiosResponse<T> | undefined> {
        return this.requestHeaderParameterData<T>(method, url);
    }

    async requestHeaderData<T>(method: HttpMethod, url: string, headerJson: any = {}): Promise<AxiosResponse<T> | undefined> {
        return this.requestHeaderParameterData<T>(method, url, headerJson);
    }

    async requestParameterData<T>(method: HttpMethod, url: string, parameterJson: any = {}): Promise<AxiosResponse<T> | undefined> {
        return this.requestHeaderParameterData<T>(method, url, {}, parameterJson);
    }

    async requestHeaderParameterData<T>(method: HttpMethod, url: string, headerJson: any = {}, parameterJson: any = {}, adapter?: AxiosAdapter): Promise<AxiosResponse<T> | undefined> {
        try {
            const configJson: AxiosRequestConfig = {
                url: url,
                method: method,
                headers: headerJson,
                validateStatus: (status: number) => {
                    return status < 500;
                }
            };

            if (adapter != undefined) {
                configJson.adapter = adapter;
            }

            if (method !== HttpMethod.GET) {
                configJson.data = parameterJson;
            } else {
                configJson.params = parameterJson;
            }

            return await axios.default.request<T>(configJson);
        } catch (error) {
            console.error(error);
        }
    }

    changeHtmlToDom(html: string): Root {
        return load(html);
    }
}