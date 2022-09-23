export function unique(arr) {
    const u = {};
    return arr.filter((v) => {
        return u[v] = !u.hasOwnProperty(v);
    });
}

export function removeSpaces(words) {
    return words.map(word => word.trim()).filter(word => !!word);
}
