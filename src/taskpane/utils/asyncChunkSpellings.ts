import {WrongWord} from "../components/SingleWrongWord";
import {asyncChunk} from "./asyncChunk";
import {DictionaryManager} from "../hooks/dictionaryManager";

export function asyncCheckSpellings(words: string[], dictionaryManager: DictionaryManager): Promise<WrongWord[]> {
    console.trace(words.length)
    return asyncChunk<string, WrongWord>(
        words,
        (chunk, acc) => dictionaryManager.checkSpellings(chunk).then(wrongWords => [...acc, ...wrongWords]),
        10,
    );
}
