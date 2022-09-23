importScripts("office.js");

function getSectionCount() {
    return Word.run(async context => {
        const sections = context.document.sections;
        sections.load("items");
        await context.sync();
    })
}

onmessage = () => {
    console.log("getSectionCount message received")
    getSectionCount().then(sectionCount => {
        postMessage({
            sectionCount,
        });
    });
};
