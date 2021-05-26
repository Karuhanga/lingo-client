import {asyncChunk} from "./asyncChunk";
import {DictionaryManager} from "../hooks/dictionaryManager";

export function asyncCheckSpellings(words: string[], dictionaryManager: DictionaryManager): Promise<string[]> {
    return asyncChunk<string, string>(
        words,
        (chunk, acc) => dictionaryManager.checkSpellings(chunk).then(wrongWords => [...acc, ...wrongWords]),
        10,
    );
}
