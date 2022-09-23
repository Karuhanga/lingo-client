importScripts("https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js");

function jumpToWord(word) {
    return word;
}

onmessage = ({data: {word}}) => {
    console.log("jumpToWord message received")
    jumpToWord(word);
};
