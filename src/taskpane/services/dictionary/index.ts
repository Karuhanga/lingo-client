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
        makeObservable(this, {
            dictionary: observable,
            isDictionaryUpdating: observable,
            weHaveADictionary: computed,
        });
        this.init();
    }

    init() {
        autorun(() => {
            this.updateDictionary().then(() => {
                this.suggestGlobalWords();
            })
        });
    }

    get weHaveADictionary(): boolean {
        return !!this.dictionary;
    }

    setDictionaryIsUpdating(isUpdating: boolean) {
        this.isDictionaryUpdating = isUpdating;
    }

    setDictionary(dictionary: OptionalDictionary) {
        this.dictionary = dictionary;
    }

    checkSpellings(toCheck: string[]): string[] {
        return toCheck.filter(word => !this.dictionary.indexedWords[word]);
    }

    suggestCorrections(word: string): WrongWordSuggestion {
        const result: [number, string] = this.dictionary.spellChecker.get(word, [], this.minSimilarityScore);
        return {
            wrong: word,
            suggestions: result.map(result => result[1]),
        };
    }

    addWordLocal(word: string) {
        const persistedDictionary: PersistedDictionary = {
            id: this.dictionary.id,
            words: this.dictionary.words,
            language: this.dictionary.language,
            localWords: unique([...this.dictionary.localWords, word]),
            globalSuggestions: this.dictionary.globalSuggestions,
        };

        this.setDictionary(saveDictionary(persistedDictionary));
    }

    addWordGlobal(word: string) {
        const persistedDictionary: PersistedDictionary = {
            id: this.dictionary.id,
            words: this.dictionary.words,
            language: this.dictionary.language,
            localWords: this.dictionary.localWords,
            globalSuggestions: [...this.dictionary.globalSuggestions, {word, synced: false}],
        };

        this.setDictionary(saveDictionary(persistedDictionary));
    }

    trackSyncedSuggestions(words: string[]) {
        const persistedDictionary: PersistedDictionary = {
            id: this.dictionary.id,
            words: this.dictionary.words,
            language: this.dictionary.language,
            localWords: this.dictionary.localWords,
            globalSuggestions: this.dictionary.globalSuggestions.map(({word, synced}) => ({word, synced: synced || words.includes(word)})),
        };

        this.setDictionary(saveDictionary(persistedDictionary));
    }

    clearLocalDictionary() {
        const persistedDictionary: PersistedDictionary = {
            id: this.dictionary.id,
            words: this.dictionary.words,
            language: this.dictionary.language,
            localWords: [],
            globalSuggestions: this.dictionary.globalSuggestions,
        };

        this.setDictionary(saveDictionary(persistedDictionary));
    }

    fetchDictionary() {
        if (this.isDictionaryUpdating) return;
        this.setDictionaryIsUpdating(true);

        const fetchDictionary = useRemoteDictionary ? api.fetchDictionary : api.fetchBundledDictionary;

        fetchDictionary(config.language)
            .then((apiDictionary: APIDictionary) => {
                const persistedDictionary: PersistedDictionary = (
                    this.dictionary ?
                        {...this.dictionary, ...apiDictionary} :
                        {localWords: [], globalSuggestions: [], ...apiDictionary}
                );
                this.setDictionary(saveDictionary(persistedDictionary));
            })
            .finally(() => this.setDictionaryIsUpdating(false));
    }

    updateDictionary() {
        this.setDictionaryIsUpdating(true);
        return api.checkWeHaveTheLatestVersion(this.dictionary)
            .then(weDo => {
                if (!weDo) this.fetchDictionary();
            })
            .finally(() => this.setDictionaryIsUpdating(false));
    }

    suggestGlobalWords() {
        if (!this.weHaveADictionary) return;
        api.suggestWords(config.language, this.dictionary.globalSuggestions.filter(suggestion => !suggestion.synced).map(suggestion => suggestion.word))
            .then((words: APIWord[]) => this.trackSyncedSuggestions(words.map(word => word.word)));
    }

    retryDictionaryDownload() {
        this.fetchDictionary();
    }
}

export const dictionaryService = new DictionaryService();
