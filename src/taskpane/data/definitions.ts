import FuzzySet from 'fuzzyset'

interface GlobalSuggestion {
    word: string;
    synced: boolean;
}

export interface APIWord {
    id: number,
    word: string,
    language: string,
}

export interface APIDictionary {
    id: number,
    words: string[],
    language: string,
}

export interface PersistedDictionary extends APIDictionary {
    localWords: string[],
    globalSuggestions: GlobalSuggestion[],
}

export interface Dictionary extends PersistedDictionary {
    indexedWords: { [word: string]: boolean },
    spellChecker: FuzzySet,
}

export type OptionalDictionary = Dictionary | null;