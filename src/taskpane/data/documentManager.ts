import {removeSpaces, unique} from "../utils/stringUtils";

interface DocumentManager {
    getWords(sectionNumber: number): Promise<string[]>;
    replaceWord(word: string, replacement: string): Promise<void>;
    jumpToWord(word: string);
    getSectionCount(): Promise<number>;
}

export const sectionNotFoundMessage = "Section not found";

export function useDocumentManager(setDebug?): DocumentManager {
    function cleanText(text) {
        for (const character of [',', '.', '!', '?']) text = text.replace(character, '');
        return unique(removeSpaces(text.toLowerCase().split(/\s+/)));
    }

    function getSectionWords(sectionNumber: number) {
        return Word.run(async context => {
            const section = context.document.sections.items[sectionNumber];
            if (!section) throw new Error(sectionNotFoundMessage);
            const sectionText = section.body.load('text');
            await context.sync();

            return cleanText(sectionText.text);
        });
    }

    function getSectionCount() {
        return Word.run(async context => {
            return context.document.sections.items.length;
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
        getWords: getSectionWords,
        replaceWord,
        jumpToWord,
        getSectionCount,
    }
}
