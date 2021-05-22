export function unique(arr: string[]) {
    const u = {};
    return arr.filter((v) => {
        return u[v] = !u.hasOwnProperty(v);
    });
}

export function removeSpaces(words: string[]) {
    return words.map(word => word.trim()).filter(word => !!word);
}
