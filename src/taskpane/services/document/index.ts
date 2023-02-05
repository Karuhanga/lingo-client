import {getDocumentWords, replaceWord, jumpToWord, getSectionCount} from "./helpers"

interface DocumentService {
    getWords(): Promise<string[]>;
    replaceWord(word: string, replacement: string): Promise<void>;
    jumpToWord(word: string);
    getSectionCount(): Promise<number>;
}

export const sectionNotFoundMessage = "Section not found";

export function useDocumentService(setDebug?): DocumentService {
    if (setDebug) setDebug("using document manager");

    return {
        getWords: getDocumentWords,
        replaceWord,
        jumpToWord,
        getSectionCount,
    }
}
