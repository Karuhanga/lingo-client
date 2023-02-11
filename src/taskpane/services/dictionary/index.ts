import {APIDictionary, APIWord, OptionalDictionary, PersistedDictionary} from "../../data/definitions";
import {useRemoteDictionary} from "../../../config";
import * as config from "../../../config";
import {api} from "./api";
import {saveDictionary} from "./helpers";
import {WrongWordSuggestion} from "../../ui/SingleWrongWord";
import {unique} from "../../utils/stringUtils";
import {autorun, computed, makeObservable, observable} from "mobx";

export class DictionaryService {
    dictionary: OptionalDictionary = undefined;
    isDictionaryUpdating: boolean = false;
    minSimilarityScore = .7

    constructor() {
        const self = this;
        makeObservable(this, {
            dictionary: observable,
            isDictionaryUpdating: observable,
            weHaveADictionary: computed,
        });
        self.init();
    }

    init() {
        const self = this;
        autorun(() => {
            self.updateDictionary().then(() => {
                self.suggestGlobalWords();
            })
        });
    }

    get weHaveADictionary(): boolean {
        const self = this;
        return !!self.dictionary;
    }

    setDictionaryIsUpdating(isUpdating: boolean) {
        const self = this;
        self.isDictionaryUpdating = isUpdating;
    }

    setDictionary(dictionary: OptionalDictionary) {
        const self = this;
        self.dictionary = dictionary;
    }

    checkSpellings(toCheck: string[]): string[] {
        const self = this;
        return toCheck.filter(word => !self.dictionary.indexedWords[word]);
    }

    suggestCorrections(word: string): WrongWordSuggestion {
        const self = this;
        const result: [number, string] = self.dictionary.spellChecker.get(word, [], self.minSimilarityScore);
        return {
            wrong: word,
            suggestions: result.map(result => result[1]),
        };
    }

    addWordLocal(word: string) {
        const self = this;
        const persistedDictionary: PersistedDictionary = {
            id: self.dictionary.id,
            words: self.dictionary.words,
            language: self.dictionary.language,
            localWords: unique([...self.dictionary.localWords, word]),
            globalSuggestions: self.dictionary.globalSuggestions,
        };

        self.setDictionary(saveDictionary(persistedDictionary));
    }

    addWordGlobal(word: string) {
        const self = this;
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
        const self = this;
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
        const self = this;
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
        const self = this;
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
        const self = this;
        self.setDictionaryIsUpdating(true);
        return api.checkWeHaveTheLatestVersion(self.dictionary)
            .then(weDo => {
                if (!weDo) self.fetchDictionary();
            })
            .finally(() => self.setDictionaryIsUpdating(false));
    }

    suggestGlobalWords() {
        const self = this;
        if (!self.weHaveADictionary) return;
        api.suggestWords(config.language, self.dictionary.globalSuggestions.filter(suggestion => !suggestion.synced).map(suggestion => suggestion.word))
            .then((words: APIWord[]) => self.trackSyncedSuggestions(words.map(word => word.word)));
    }

    retryDictionaryDownload() {
        const self = this;
        self.fetchDictionary();
    }
}

export const dictionaryService = new DictionaryService();
