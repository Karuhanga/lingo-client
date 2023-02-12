import {useDocumentService} from "../document";
import useInterval from "@use-it/interval";
import {makeObservable, observable, action} from "mobx";
import {useDictionaryService} from "../dictionary";


export class SpellChecker {
    documentService = useDocumentService();
    dictionaryService = useDictionaryService();
    spellCheckEverySeconds = 5 * 60;  // every 5 minutes
    isSpellChecking: boolean = false;
    wrongWords: string[] = [];

    constructor() {
        makeObservable(this, {
            isSpellChecking: observable,
            setIsSpellChecking: action,
            wrongWords: observable,
            setWrongWords: action,
            runSpellCheck: action,
            removeWrongWord: action,
        });
    }

    setIsSpellChecking(isSpellChecking: boolean) {
        self.isSpellChecking = isSpellChecking;
    }

    setWrongWords(wrongWords: string[]) {
        self.wrongWords = wrongWords;
    }

    removeWrongWord(word: string) {
        self.setWrongWords(self.wrongWords.filter(wrongWord => wrongWord !== word));
    }

    runSpellCheck() {
        if (self.dictionaryService.isDictionaryAvailable && !self.isSpellChecking) {
            self.setIsSpellChecking(true);

            self.documentService.getWords()
                .then(timeGetWords)
                .then(words => self.dictionaryService.checkSpellings(words))
                .then(timeCheckSpellings)
                .then(self.setWrongWords)
                .then(timeSetWords)
                .finally(() => self.setIsSpellChecking(false));
        }
    }
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

const spellChecker = new SpellChecker();
const self = spellChecker;  // avoiding `this` hell

export function useSpellCheckerService (): SpellChecker {
    useInterval(() => spellChecker.runSpellCheck(), spellChecker.spellCheckEverySeconds * 1000);
    return spellChecker;
}
