importScripts(
    "../via/controller/object.js",
    "../via/controller/property.js",
    "../via/controller/controller.js"
);
Via.postMessage = (data => self.postMessage(data));

document = via.document;
window = self;
window.document = document;

importScripts("../office.js");

function getSectionCount() {
    return Word.run(async context => {
        const sections = context.document.sections;
        sections.load("items");
        await context.sync();
    })
}

onmessage = (e) => {
    const {data: {messageType}} = e;
    if (messageType !== "lingo") return Via.OnMessage(e.data);

    console.log("getSectionCount message received")
    getSectionCount().then(sectionCount => {
        postMessage({
            sectionCount,
            messageType: "lingo",
        });
    });
};
