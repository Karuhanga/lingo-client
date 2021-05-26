import {removeSpaces, unique} from "../utils/utils";

interface DocumentManager {
    getWords(): Promise<string[]>;
    replaceWord(word: string, replacement: string): Promise<void>;
    jumpToWord(word: string);
}

export function useDocumentManager(setDebug?): DocumentManager {
    function cleanText(text) {
        for (const character of [',', '.', '!', '?']) text = text.replace(character, '');
        return unique(removeSpaces(text.toLowerCase().split(/\s+/)));
    }

    function getDocumentWords() {
        return Word.run(async context => {
            const body = context.document.body.load('text');
            body.load('text');
            await context.sync();

            return cleanText(body.text);
        });
    }

    function replaceWord(word: string, replacement: string) {
        return Word.run(async function (context) {
            const searchResults = context.document.body.search(word, {ignorePunct: true, matchWholeWord: true});
            context.load(searchResults);
            await context.sync();

            if (setDebug) setDebug(JSON.stringify(searchResults.toJSON()));

            searchResults.items.forEach(item => {
                item.insertText(replacement, Word.InsertLocation.replace);
            });

            // Synchronize the document state by executing the queued commands,
            // and return a promise to indicate task completion.
            await context.sync();
        })
    }

    function jumpToWord(word: string) {
        return word;
    }

    return {
        getWords: getDocumentWords,
        replaceWord,
        jumpToWord,
    }
}
