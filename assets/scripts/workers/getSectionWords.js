importScripts("https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js");

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

onmessage = ({data: {sectionNumber}}) => {
    console.log("getSectionWords message received")
    getSectionWords(sectionNumber).then(sectionwords => {
        postMessage({
            sectionwords,
        });
    });
};
