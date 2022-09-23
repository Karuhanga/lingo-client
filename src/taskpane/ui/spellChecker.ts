import {useDictionaryManager} from "../data/dictionaryManager";
import {sectionNotFoundMessage, useDocumentManager} from "../data/document/documentManager";
import {useEffect, useMemo, useState} from "react";
import {onTimeWindow} from "../utils/asyncUtils";
import useInterval from "@use-it/interval";
import {cloneDeep, union} from "lodash";

interface SpellChecker {
    isSpellChecking: boolean;
    wrongWords: string[];
    removeWrongWord(word: string): void;
    runSpellCheck(): void;
}

const spellCheckEverySeconds = 2;
const updateSectionCountEverySeconds = 5;

export function useSpellChecker (): SpellChecker {
    const dictionaryManager = useDictionaryManager();
    const documentManager = useDocumentManager();

    const [isSpellChecking, setIsSpellChecking] = useState(false);
    const [nextSectionToSpellCheck, setNextSectionToSpellCheck] = useState(0);
    const [wrongWordsBySection, setWrongWordsBySection] = useState<{ [key: number]: string[] }>({});
    const [sectionCount, setSectionCount] = useState(0);

    const wrongWords: string[] = useMemo(() => {
        const nextWrongWords = [];
        for (let i = 0; i < sectionCount; i++) {
            nextWrongWords.push(...(wrongWordsBySection[i] || []));
        }

        return union(nextWrongWords);
    }, [wrongWordsBySection, sectionCount]);

    async function removeWrongWord(wrongWord: string) {
        const nextWrongWordsBySection = cloneDeep(wrongWordsBySection);
        for (let i = 0; i < sectionCount; i++) {
            nextWrongWordsBySection[i] = (nextWrongWordsBySection[i] || []).filter(word => word !== wrongWord);
        }

        setWrongWordsBySection(nextWrongWordsBySection);
    }

    function timeGetWords(d) {
        console.timeEnd("get words");
        console.time("check spellings");
        return d;
    }

    function timeCheckSpellings(d) {
        console.timeEnd("check spellings");
        console.time("set words");
        return d;
    }

    function timeSetWords(d) {
        console.timeEnd("set words");
        return d;
    }

    function runSpellCheck() {
        if (dictionaryManager.weHaveADictionary() && !isSpellChecking) {
            setIsSpellChecking(true);

            onTimeWindow(() => {
                console.time("get words");
                return documentManager.getWords(nextSectionToSpellCheck);
            })
                .then(timeGetWords)
                // asyncCheckSpellings if we hit a performance bottleneck. todo: test on 10000 words
                .then(words => onTimeWindow(() => dictionaryManager.checkSpellings(words)))
                .then(timeCheckSpellings)
                .then(wrongWordsForSection => onTimeWindow(() => {
                    setWrongWordsBySection({...wrongWordsBySection, [nextSectionToSpellCheck]: wrongWordsForSection});
                    setNextSectionToSpellCheck(nextSectionToSpellCheck + 1);
                }))
                .then(timeSetWords)
                .catch(error => {
                        if (error.message === sectionNotFoundMessage) {
                            setNextSectionToSpellCheck(0);
                        } else {
                            console.error(error);
                        }
                    }
                )
                .finally(() => setIsSpellChecking(false));
        }
    }

    useInterval(() => runSpellCheck(), spellCheckEverySeconds * 1000);
    useInterval(() => documentManager.getSectionCount().then(setSectionCount), updateSectionCountEverySeconds * 1000);
    useEffect(() => console.log(nextSectionToSpellCheck, "nextSectionToSpellCheck"), [nextSectionToSpellCheck]);

    return {
        isSpellChecking,
        wrongWords,
        removeWrongWord,
        runSpellCheck,
    }
}
