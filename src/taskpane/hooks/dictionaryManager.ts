import {useState} from "react";

interface DictionaryManager {
    weHaveADictionary: boolean;
}

export function useDictionaryManager(): DictionaryManager {
    const [weHaveADictionary] = useState(true);

    return {weHaveADictionary};
}
