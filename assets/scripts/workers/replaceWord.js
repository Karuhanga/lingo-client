importScripts("https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js");

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

onmessage = ({data: {word, replacement}}) => {
    console.log("replaceWord message received")
    replaceWord(word, replacement);
};
