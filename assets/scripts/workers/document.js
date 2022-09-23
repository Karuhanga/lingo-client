importScripts("https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js");

const sectionNotFoundMessage = "Section not found";

console.log("11")

const utils = {
    cleanText(text) {
        for (const character of [',', '.', '!', '?']) text = text.replace(character, '');
        return utils.unique(utils.removeSpaces(text.toLowerCase().split(/\s+/)));
    },
    unique(arr) {
        const u = {};
        return arr.filter((v) => {
            return u[v] = !u.hasOwnProperty(v);
        });
    },
    removeSpaces(words) {
        return words.map(word => word.trim()).filter(word => !!word);
    },
}

console.log("22")

function getSectionWords(sectionNumber) {
    return Word.run(async context => {
        const sections = context.document.sections;
        sections.load("items");
        await context.sync();

        const section = sections.items[sectionNumber];
        if (!section) throw new Error(sectionNotFoundMessage);
        const sectionText = section.body.load('text');
        await context.sync();

        return utils.cleanText(sectionText.text);
    });
}

console.log("33")

function getSectionCount() {
    return Word.run(async context => {
        const sections = context.document.sections;
        sections.load("items");
        await context.sync();
    })
}

console.log("44")

function replaceWord(word, replacement) {
    return Word.run(async function (context) {
        const searchResults = context.document.body.search(word, {ignorePunct: true, matchWholeWord: true});
        context.load(searchResults);
        await context.sync();

        searchResults.items.forEach(item => {
            item.insertText(replacement, Word.InsertLocation.replace);
        });

        // Synchronize the document state by executing the queued commands,
        // and return a promise to indicate task completion.
        await context.sync();
    })
}

console.log("55")

function jumpToWord(word) {
    return word;
}
