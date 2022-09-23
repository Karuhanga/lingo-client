import {useDictionaryManager} from "../data/dictionaryManager";
import {useEffect, useMemo, useState} from "react";
import useInterval from "@use-it/interval";
import {cloneDeep, union} from "lodash";
import {DocumentManager, useDocumentManager} from "../data/documentManager";


interface SpellChecker {
    wrongWords: string[];
    removeWrongWord(word: string): void;
    runSpellCheck(): void;
    documentManager: DocumentManager;
}

const spellCheckEverySeconds = 2;

export function useSpellChecker (): SpellChecker {
    const dictionaryManager = useDictionaryManager();
    const documentManager = useDocumentManager({onSectionWordsReady: spellCheckSectionWords, resetNextSectionToSpellCheck});
    const {sectionCount, getSectionWords} = documentManager;

    const [nextSectionToSpellCheck, setNextSectionToSpellCheck] = useState(0);
    const [wrongWordsBySection, setWrongWordsBySection] = useState<{ [key: number]: string[] }>({});
    const wrongWords: string[] = useMemo(() => {
        const nextWrongWords = [];
        for (let i = 0; i < sectionCount; i++) {
            nextWrongWords.push(...(wrongWordsBySection[i] || []));
        }

        return union(nextWrongWords);
    }, [wrongWordsBySection, sectionCount]);

    function spellCheckSectionWords(words: string[]) {
        dictionaryManager.checkSpellings(words).then(wrongWordsForSection => {
            setWrongWordsBySection({...wrongWordsBySection, [nextSectionToSpellCheck]: wrongWordsForSection});
            setNextSectionToSpellCheck(nextSectionToSpellCheck + 1);
        })
    }

    function resetNextSectionToSpellCheck() {
        setNextSectionToSpellCheck(0);
    }

    async function removeWrongWord(wrongWord: string) {
        const nextWrongWordsBySection = cloneDeep(wrongWordsBySection);
        for (let i = 0; i < sectionCount; i++) {
            nextWrongWordsBySection[i] = (nextWrongWordsBySection[i] || []).filter(word => word !== wrongWord);
        }

        setWrongWordsBySection(nextWrongWordsBySection);
    }

    useInterval(() => getSectionWords(nextSectionToSpellCheck), spellCheckEverySeconds * 1000);
    useEffect(() => console.log(nextSectionToSpellCheck, "nextSectionToSpellCheck"), [nextSectionToSpellCheck]);

    return {
        wrongWords,
        removeWrongWord,
        documentManager: documentManager,
        runSpellCheck() {
            getSectionWords(nextSectionToSpellCheck);
        },
    }
}
