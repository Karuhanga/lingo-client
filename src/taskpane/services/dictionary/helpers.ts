import {OptionalDictionary, PersistedDictionary} from "../../data/definitions";
import * as config from "../../../config";
import {unique} from "../../utils/stringUtils";
import FuzzySet from 'fuzzyset'

export function loadDictionary(): OptionalDictionary {
    console.time("fetch")
    const savedDictionary = localStorage.getItem(config.dictionaryStorageKey);
    console.timeEnd("fetch")

    if (savedDictionary === null) return null;
    else {
        console.time("parse")
        const dictionary: PersistedDictionary = JSON.parse(savedDictionary);
        console.timeEnd("parse")
        const words = unique([...dictionary.words, ...dictionary.localWords, ...dictionary.globalSuggestions.map(globalSuggestion => globalSuggestion.word)]);

        const indexedWords = {};
        words.forEach(word => indexedWords[word] = true);

        console.time("spellChecker");
        const spellChecker = FuzzySet(words);
        console.timeEnd("spellChecker");

        return {
            ...dictionary,
            indexedWords,
            spellChecker,
        }
    }
}

export function saveDictionary(apiDictionary: PersistedDictionary): OptionalDictionary {
    localStorage.setItem(config.dictionaryStorageKey, JSON.stringify(apiDictionary))
    return loadDictionary();
}
