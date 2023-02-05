import axios from "axios";
import * as config from "../../../config";
import {APIDictionary, APIWord, OptionalDictionary} from "../../data/definitions";
import * as bundledDictionary from "../../data/bundledDictionary";
import {useRemoteDictionary} from "../../../config";

const axiosInstance = axios.create({
    baseURL: config.apiURL,
    timeout: 30000,
});
export const api = {
    fetchDictionary(languageName: string): Promise<APIDictionary> {
        return axiosInstance.get(`/languages/${languageName}/dictionaries/versions/latest`).then(result => result.data.data).catch(console.error);
    },
    fetchBundledDictionary(languageName: string): Promise<APIDictionary> {
        if (languageName !== bundledDictionary.language) throw Error(`Requested language(${languageName}) not available.`)
        return new Promise(() => bundledDictionary);
    },
    suggestWords(languageName: string, words: string[]): Promise<APIWord[]> {
        if (!useRemoteDictionary) return new Promise(() => []);
        return axiosInstance.post(`/languages/${languageName}/suggestions`, {words}).then(result => result.data.data).catch(console.error);
    },
    checkWeHaveTheLatestVersion(dictionary: OptionalDictionary): Promise<boolean> {
        if (!dictionary) return Promise.resolve(false);
        if (!useRemoteDictionary) return Promise.resolve(dictionary.id === bundledDictionary.id);
        return axiosInstance.get(`/dictionaries/versions/${dictionary.id}/is_latest`).then(result => result.data.data.is_latest).catch(console.error);
    },
};
