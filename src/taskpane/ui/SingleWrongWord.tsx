import {Button, ButtonType, DefaultButton} from "office-ui-fabric-react/lib/Button";
import * as React from "react";
import {useDocumentManager} from "../data/document/documentManager";
import {DictionaryManager} from "../data/dictionaryManager";

export interface WrongWordSuggestion {wrong: string, suggestions: string[]}

export interface SingleWrongWordProps {
    word: string;
    removeWrongWord(wrongWord: string): void;
    dictionaryManager: DictionaryManager;
    setDebug?(message: string): void;
}

export function SingleWrongWord({word, removeWrongWord, dictionaryManager, setDebug}: SingleWrongWordProps) {
    const wrongWord = dictionaryManager.suggestCorrections(word);
    const firstSuggestion = wrongWord.suggestions[0];
    const weHaveSuggestions = !!firstSuggestion;
    const documentManager = useDocumentManager(setDebug);

    return (
        <tr>
            <td style={{maxWidth: '100px'}}>
                <DefaultButton
                    split
                    style={{width: "100%", border: "0", overflow: "hidden", textOverflow: "ellipsis"}}
                    menuIconProps={{iconName: "__nonExistent__"}}
                    text={wrongWord.wrong}
                    onClick={() => documentManager.jumpToWord(wrongWord.wrong)}
                />
            </td>
            <td style={{verticalAlign: "middle"}}>&nbsp;{weHaveSuggestions ? " → " : ""}&nbsp;</td>
            <td style={{maxWidth: '100px'}}>
                {!weHaveSuggestions ?  "" : (
                    <DefaultButton
                        split
                        style={{width: "100%", border: "0", overflow: "hidden", textOverflow: "ellipsis"}}
                        menuIconProps={{iconName: "__nonExistent__"}}
                        text={firstSuggestion}
                        menuProps={{
                            items: wrongWord.suggestions.map(suggestion => ({
                                key: suggestion,
                                text: suggestion,
                                onClick: () => {documentManager.replaceWord(wrongWord.wrong, suggestion).then(() => removeWrongWord(wrongWord.wrong))},
                            })),
                        }}
                    />
                )}
            </td>
            <td>
                {!weHaveSuggestions ? null : (
                    <Button
                        buttonType={ButtonType.icon}
                        iconProps={{ iconName: "CheckMark" }}
                        onClick={() => {documentManager.replaceWord(wrongWord.wrong, firstSuggestion).then(() => removeWrongWord(wrongWord.wrong))}}
                    />
                )}
            </td>
            <td>
                <Button
                    split
                    buttonType={ButtonType.icon}
                    menuProps={{
                        items: [
                            {
                                key: 'addToPrivateDictionary',
                                text: 'Add to my dictionary',
                                iconProps: { iconName: 'Add' },
                                onClick: () => {
                                    dictionaryManager.addWordLocal(wrongWord.wrong);
                                    removeWrongWord(wrongWord.wrong);
                                },
                            },
                            {
                                key: 'addToGlobalDictionary',
                                text: 'Propose Word',
                                disabled: true,
                                iconProps: { iconName: 'World' },
                                onClick: () => {
                                    dictionaryManager.addWordGlobal(wrongWord.wrong);
                                    removeWrongWord(wrongWord.wrong);
                                },
                            },
                        ],
                    }}
                />
            </td>
        </tr>
    )
}
