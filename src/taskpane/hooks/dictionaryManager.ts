import {useEffect, useState} from "react";
import axios from "axios";
import {url} from "../../config";
import {WrongWord} from "../components/SingleWrongWord";

interface DictionaryManager {
    weHaveADictionary(): boolean;
    dictionary: OptionalDictionary;
    dictionaryUpdating: boolean;
    checkSpellings(toCheck: string[]);
    retryDictionaryDownload();
}

interface Dictionary {
    id: number,
    words: string[],
    language: string,
}

type OptionalDictionary = Dictionary | null;

const dictionaryStorageKey = 'lingoDictionary';

export function useDictionaryManager(): DictionaryManager {
    const [dictionary, setDictionary] = useState<OptionalDictionary>(loadDictionary());
    const [ongoingAPICall, setOngoingAPICall] = useState<boolean>(false);

    function checkSpellings(toCheck: string[]): Promise<WrongWord[]> {
        return Promise.resolve(
            toCheck
            .filter(word => !dictionary.words.includes(word))
            .map(word => ({wrong: word, suggestions: ["omuntu", "omulala"]}))
        );
    }

    function mutexFetchDictionary() {
        if (ongoingAPICall) return;

        setOngoingAPICall(true);
        fetchDictionary('Luganda')
        .then(dictionary => {
            saveDictionary(dictionary);
            setDictionary(dictionary);
        })
        .finally(() => setOngoingAPICall(false));
    }

    useEffect(() => {
        setOngoingAPICall(true);
        checkWeHaveTheLatestVersion(dictionary)
            .then(weDo => {
                if (!weDo) mutexFetchDictionary();
            })
            .finally(() => setOngoingAPICall(false));
    }, []);

    return {
        weHaveADictionary: () => !!dictionary,
        dictionary,
        dictionaryUpdating: ongoingAPICall,
        checkSpellings,
        retryDictionaryDownload: mutexFetchDictionary,
    };
}

function fetchDictionary(languageName: string): Promise<Dictionary> {
    return axios.get(`${url}/languages/${languageName}/dictionaries/versions/latest`).then(result => result.data.data);
}

function checkWeHaveTheLatestVersion(dictionary: OptionalDictionary) {
    if (!dictionary) return Promise.resolve(false);
    return axios.get(`${url}/dictionaries/versions/${dictionary.id}/is_latest`).then(result => result.data.data.is_latest);
}

function loadDictionary(): OptionalDictionary {
    const savedDictionary = localStorage.getItem(dictionaryStorageKey);

    if (savedDictionary === null) return null;
    else return JSON.parse(savedDictionary)
}

function saveDictionary(dictionary: Dictionary) {
    localStorage.setItem(dictionaryStorageKey, JSON.stringify(dictionary))
}
