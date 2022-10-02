import {getSectionWords, replaceWord, jumpToWord, getSectionCount} from "./"

interface DocumentManager {
    getWords(sectionNumber: number): Promise<string[]>;
    replaceWord(word: string, replacement: string): Promise<void>;
    jumpToWord(word: string);
    getSectionCount(): Promise<number>;
}

export const sectionNotFoundMessage = "Section not found";

export function useDocumentManager(setDebug?): DocumentManager {
    if (setDebug) setDebug("using document manager");

    return {
        getWords: getSectionWords,
        replaceWord,
        jumpToWord,
        getSectionCount,
    }
}
