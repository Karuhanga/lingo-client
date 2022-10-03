import {useDictionaryManager} from "../data/dictionaryManager";
import {useDocumentManager} from "../data/document/documentManager";
import {useState} from "react";
import useInterval from "@use-it/interval";

interface SpellChecker {
    isSpellChecking: boolean;
    wrongWords: string[];
    removeWrongWord(word: string): void;
    runSpellCheck(): void;
}

const spellCheckEverySeconds = 5 * 60;  // every 5 minutes

export function useSpellChecker (): SpellChecker {
    /*
    * Should be a singleton
    * */

    const dictionaryManager = useDictionaryManager();
    const documentManager = useDocumentManager();

    const [isSpellChecking, setIsSpellChecking] = useState(false);
    const [wrongWords, setWrongWords] = useState<string[]>([]);

    async function removeWrongWord(wrongWord: string) {
        setWrongWords(wrongWords.filter(word => word !== wrongWord));
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

            documentManager.getWords()
            .then(timeGetWords)
            .then(words => dictionaryManager.checkSpellings(words))
            .then(timeCheckSpellings)
            .then(setWrongWords)
            .then(timeSetWords)
            .catch(console.error)
            .finally(() => setIsSpellChecking(false));
        }
    }

    useInterval(() => runSpellCheck(), spellCheckEverySeconds * 1000);

    return {
        isSpellChecking,
        wrongWords,
        removeWrongWord,
        runSpellCheck,
    }
}
