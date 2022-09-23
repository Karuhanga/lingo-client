import {useEffect, useRef, useState} from "react";
import useInterval from "@use-it/interval";

const updateSectionCountEverySeconds = 5;
const sectionNotFoundMessage = "Section not found";

export interface DocumentManager {
    sectionCount: number,
    getSectionWords(sectionNumber): void,
    jumpToWord(word: string): void,
    replaceWord(word: string, replacement: string): Promise<void>,
}

export function useDocumentManager({onSectionWordsReady, resetNextSectionToSpellCheck}: {onSectionWordsReady(words: string[]): void, resetNextSectionToSpellCheck(): void}): DocumentManager {
    const [sectionCount, setSectionCount] = useState(0);
    const getSectionCount = useRef<Worker|null>(null);
    const getSectionWords = useRef<Worker|null>(null);
    const jumpToWord = useRef<Worker|null>(null);
    const replaceWord = useRef<Worker|null>(null);

    useEffect(() => {
        getSectionCount.current = new window.Worker('./assets/scripts/workers/getSectionCount.js');
        getSectionCount.current.onerror = console.error;
        getSectionCount.current.onmessage = (e) => {
            setSectionCount(e.data.sectionCount as number);
        };
        return () => {
            getSectionCount.current.terminate();
            getSectionCount.current = null;
        };
    }, []);
    useInterval(() => {
        getSectionCount.current?.postMessage({});
    }, updateSectionCountEverySeconds * 1000);

    useEffect(() => {
        getSectionWords.current = new window.Worker('./assets/scripts/workers/getSectionWords.js');
        getSectionWords.current.onerror = error => {
            if (error.message === sectionNotFoundMessage) {
                resetNextSectionToSpellCheck();
            } else {
                console.error(error);
            }
        };
        getSectionWords.current.onmessage = (e) => {
            onSectionWordsReady(e.data.sectionWords as string[]);
        };
        return () => {
            getSectionWords.current.terminate();
            getSectionWords.current = null;
        };
    }, []);

    useEffect(() => {
        jumpToWord.current = new window.Worker('./assets/scripts/workers/jumpToWord.js');
        jumpToWord.current.onerror = console.error;
        jumpToWord.current.onmessage = console.log;
        return () => {
            jumpToWord.current.terminate();
            jumpToWord.current = null;
        };
    }, []);

    useEffect(() => {
        replaceWord.current = new window.Worker('./assets/scripts/workers/replaceWord.js');
        replaceWord.current.onerror = console.error;
        replaceWord.current.onmessage = console.log;
        return () => {
            replaceWord.current.terminate();
            replaceWord.current = null;
        };
    }, []);

    return {
        sectionCount,
        getSectionWords(sectionNumber) {
            getSectionWords.current?.postMessage({sectionNumber});
        },
        jumpToWord(word: string) {
            jumpToWord.current?.postMessage({word});
        },
        replaceWord(word: string, replacement: string) {
            jumpToWord.current?.postMessage({word, replacement});
            return Promise.resolve();
        },
    }
}
