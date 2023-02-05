import {Dictionary, OptionalDictionary, PersistedDictionary} from "../../data/definitions";
import * as config from "../../../config";
import {unique} from "../../utils/stringUtils";
import FuzzySet from 'fuzzyset'

export function loadDictionary(): OptionalDictionary {
    const savedDictionary = localStorage.getItem(config.dictionaryStorageKey);

    if (savedDictionary === null) return null;
    else {
        const dictionary: PersistedDictionary = JSON.parse(savedDictionary);
        const words = unique([...dictionary.words, ...dictionary.localWords, ...dictionary.globalSuggestions.map(globalSuggestion => globalSuggestion.word)]);

        const indexedWords = {};
        words.forEach(word => indexedWords[word] = true);

        return {
            ...dictionary,
            indexedWords,
            spellChecker: new FuzzySet(words),
        }
    }
}

export function saveDictionary(apiDictionary: PersistedDictionary): Dictionary {
    localStorage.setItem(config.dictionaryStorageKey, JSON.stringify(apiDictionary))
    return loadDictionary();
}
