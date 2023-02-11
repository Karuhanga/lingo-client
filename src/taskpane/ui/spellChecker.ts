import {useDocumentService} from "../services/document";
import {useState} from "react";
import useInterval from "@use-it/interval";
import {dictionaryService} from "../services/dictionary";

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

    const documentService = useDocumentService();

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
        if (dictionaryService.weHaveADictionary && !isSpellChecking) {
            setIsSpellChecking(true);

            documentService.getWords()
            .then(timeGetWords)
            .then(words => dictionaryService.checkSpellings(words))
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
