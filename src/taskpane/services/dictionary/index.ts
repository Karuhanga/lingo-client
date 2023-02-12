import {APIDictionary, APIWord, OptionalDictionary, PersistedDictionary} from "../../data/definitions";
import {useRemoteDictionary} from "../../../config";
import * as config from "../../../config";
import {api} from "./api";
import {saveDictionary} from "./helpers";
import {WrongWordSuggestion} from "../../ui/SingleWrongWord";
import {unique} from "../../utils/stringUtils";
import {autorun, action, makeObservable, observable} from "mobx";

export class DictionaryService {
    dictionary: OptionalDictionary = undefined;  // not observable because it's quite big and we don't need to re-render on change
    isDictionaryAvailable: boolean = false;
    isDictionaryUpdating: boolean = false;
    minSimilarityScore = .7

    constructor() {
        makeObservable(this, {
            isDictionaryUpdating: observable,
            isDictionaryAvailable: observable,
            setDictionaryIsUpdating: action,
        });
    }

    setDictionaryIsUpdating(isUpdating: boolean) {
        self.isDictionaryUpdating = isUpdating;
    }

    setDictionary(dictionary: OptionalDictionary) {
        self.dictionary = dictionary;
        self.isDictionaryAvailable = true;
    }

    checkSpellings(toCheck: string[]): string[] {
        return toCheck.filter(word => !self.dictionary.indexedWords[word]);
    }

    suggestCorrections(word: string): WrongWordSuggestion {
        const result: [number, string] = self.dictionary.spellChecker.get(word, [], self.minSimilarityScore);
        return {
            wrong: word,
            suggestions: result.map(result => result[1]),
        };
    }

    addWordLocal(word: string) {
        const persistedDictionary: PersistedDictionary = {
            id: self.dictionary.id,
            words: self.dictionary.words,
            language: self.dictionary.language,
            localWords: unique([...self.dictionary.localWords, word]),
            globalSuggestions: self.dictionary.globalSuggestions,
        };

        console.time("saveDictionary");
        self.setDictionary(saveDictionary(persistedDictionary));
        console.timeEnd("saveDictionary");
    }

    addWordGlobal(word: string) {
        const persistedDictionary: PersistedDictionary = {
            id: self.dictionary.id,
            words: self.dictionary.words,
            language: self.dictionary.language,
            localWords: self.dictionary.localWords,
            globalSuggestions: [...self.dictionary.globalSuggestions, {word, synced: false}],
        };

        self.setDictionary(saveDictionary(persistedDictionary));
    }

    trackSyncedSuggestions(words: string[]) {
        const persistedDictionary: PersistedDictionary = {
            id: self.dictionary.id,
            words: self.dictionary.words,
            language: self.dictionary.language,
            localWords: self.dictionary.localWords,
            globalSuggestions: self.dictionary.globalSuggestions.map(({word, synced}) => ({word, synced: synced || words.includes(word)})),
        };

        self.setDictionary(saveDictionary(persistedDictionary));
    }

    clearLocalDictionary() {
        const persistedDictionary: PersistedDictionary = {
            id: self.dictionary.id,
            words: self.dictionary.words,
            language: self.dictionary.language,
            localWords: [],
            globalSuggestions: self.dictionary.globalSuggestions,
        };

        self.setDictionary(saveDictionary(persistedDictionary));
    }

    fetchDictionary() {
        if (self.isDictionaryUpdating) return;
        self.setDictionaryIsUpdating(true);

        const fetchDictionary = useRemoteDictionary ? api.fetchDictionary : api.fetchBundledDictionary;

        fetchDictionary(config.language)
            .then((apiDictionary: APIDictionary) => {
                const persistedDictionary: PersistedDictionary = (
                    self.dictionary ?
                        {...self.dictionary, ...apiDictionary} :
                        {localWords: [], globalSuggestions: [], ...apiDictionary}
                );
                self.setDictionary(saveDictionary(persistedDictionary));
            })
            .finally(() => self.setDictionaryIsUpdating(false));
    }

    updateDictionary() {
        return api.checkWeHaveTheLatestVersion(self.dictionary)
            .then(weDo => {
                if (!weDo) self.fetchDictionary();
            })
    }

    suggestGlobalWords() {
        if (!self.isDictionaryAvailable) return;
        api.suggestWords(config.language, self.dictionary.globalSuggestions.filter(suggestion => !suggestion.synced).map(suggestion => suggestion.word))
            .then((words: APIWord[]) => self.trackSyncedSuggestions(words.map(word => word.word)));
    }

    retryDictionaryDownload() {
        self.fetchDictionary();
    }
}

const dictionaryService = new DictionaryService();
const self = dictionaryService;  // avoiding `this` hell
autorun(() => {
    dictionaryService.updateDictionary().then(() => {
        dictionaryService.suggestGlobalWords();
    })
});

export function useDictionaryService(): DictionaryService {
    return dictionaryService;
}
