import {DocumentManager} from "../hooks/documentManager";
import {DictionaryManager} from "../hooks/dictionaryManager";
import {WrongWord} from "../components/SingleWrongWord";

export function run(
    documentManager: DocumentManager,
    dictionaryManager: DictionaryManager,
    setWrongWords: (words: WrongWord[]) => void ,
) {
    return documentManager.getWords()
        .then(dictionaryManager.checkSpellings)
        .then(newWrongWords => setWrongWords(uniqueWrongWords(newWrongWords)))
}

function uniqueWrongWords(arr: WrongWord[]) {
    const u = {};
    return arr.filter((v) => {
        return u[v.wrong] = !u.hasOwnProperty(v.wrong);
    });
}
