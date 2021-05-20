import {useEffect, useState} from "react";
import axios from "axios";
import Fuse from 'fuse.js'
import {url} from "../../config";
import {WrongWord} from "../components/SingleWrongWord";

export interface DictionaryManager {
    weHaveADictionary(): boolean;
    dictionary: OptionalDictionary;
    dictionaryUpdating: boolean;
    checkSpellings(toCheck: string[]): Promise<string[]>;
    retryDictionaryDownload();
    suggestCorrections(word: string, correctionCount: 5): WrongWord;
}

interface APIDictionary {
    id: number,
    words: string[],
    language: string,
}

interface Dictionary extends APIDictionary{
    indexedWords: { [word: string]: boolean },
    spellChecker: Fuse<string>,
}

type OptionalDictionary = Dictionary | null;

const dictionaryStorageKey = 'lingoDictionary';

export function useDictionaryManager(): DictionaryManager {
    const [dictionary, setDictionary] = useState<OptionalDictionary>(loadDictionary());
    const [ongoingAPICall, setOngoingAPICall] = useState<boolean>(false);

    function checkSpellings(toCheck: string[]): Promise<string[]> {
        return Promise.resolve(
            toCheck
            .filter(word => !dictionary.indexedWords[word])
        );
    }

    function suggestCorrections(word: string): WrongWord {
        const result = dictionary.spellChecker.search(word, {limit: 5});
        return {
            wrong: word,
            // todo: do we want to use the weight here somehow?
            suggestions: result.map(result => result.item),
        };
    }

    function mutexFetchDictionary() {
        if (ongoingAPICall) return;

        setOngoingAPICall(true);
        fetchDictionary('Luganda')
        .then((apiDictionary: APIDictionary) => {
            const dictionary = saveDictionary(apiDictionary);
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
        suggestCorrections,
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
    else {
        const dictionary: APIDictionary = JSON.parse(savedDictionary);
        const options = {
            // https://fusejs.io/api/options.html
            includeScore: true,
            minMatchCharLength: 3,
            threshold: .3,
            distance: 10,
        };

        return {
            ...dictionary,
            indexedWords: dictionary.words.reduce((previousValue, currentValue) => ({...previousValue, [currentValue]: true}), {}),
            spellChecker: new Fuse(dictionary.words, options)
        }
    }
}

function saveDictionary(apiDictionary: APIDictionary) {
    localStorage.setItem(dictionaryStorageKey, JSON.stringify(apiDictionary))
    return loadDictionary();
}
