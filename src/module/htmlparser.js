import * as axios from "axios";
import * as cheerio from "cheerio";
//https://yamoo9.github.io/axios/guide/error-handling.html

export async function getHtmlDocument(url) {
    try {
      return await axios.default.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36",
          "Content-Type": "text/html"
        },
        validateStatus: function (status) {
          return status < 500;
        }
      });
    } catch (error) {
      console.error(error);
    }
}

export async function getHtmlDocumentParameter(url, parameterJson) {
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

export function changeHtmlToDom(html) {
  return cheerio.load(html);
}