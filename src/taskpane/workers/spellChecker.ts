import {getDocumentManager} from "../hooks/documentManager";
import {WrongWord} from "../components/SingleWrongWord";
import {checkSpellings, loadDictionary} from "../hooks/dictionaryManager";

export function run() {
    const documentManager = getDocumentManager();

    console.trace(["In worker: ", window.document === undefined]);

    return documentManager.getWords()
        .then(wordsToCheck => checkSpellings(wordsToCheck, loadDictionary()))
        .then(uniqueWrongWords);
}

function uniqueWrongWords(arr: WrongWord[]) {
    const u = {};
    return arr.filter((v) => {
        return u[v.wrong] = !u.hasOwnProperty(v.wrong);
    });
}
