import {removeSpaces, unique} from "../../utils/stringUtils";
import {sectionNotFoundMessage} from "./index";

function cleanText(text) {
    for (const character of [',', '.', '!', '?']) text = text.replace(character, '');
    return unique(removeSpaces(text.toLowerCase().split(/\s+/)));
}

export function getDocumentWords() {
    return Word.run(async context => {
        const body = context.document.body.load('text');
        await context.sync();

        return cleanText(body.text);
    });
}

export function getSectionWords(sectionNumber: number) {
    return Word.run(async context => {
        const sections = context.document.sections;
        sections.load("items");
        await context.sync();

        const section = sections.items[sectionNumber];
        if (!section) throw new Error(sectionNotFoundMessage);
        const sectionText = section.body.load('text');
        await context.sync();

        return cleanText(sectionText.text);
    });
}

export function getSectionCount() {
    return Word.run(async context => {
        const sections = context.document.sections;
        sections.load("items");
        await context.sync();

        return sections.items.length;
    });
}

export function replaceWord(word: string, replacement: string, setDebug?) {
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

export function jumpToWord(word: string) {
    return word;
}
