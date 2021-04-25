import {Button, ButtonType, DefaultButton} from "office-ui-fabric-react";
import * as React from "react";
import {useDocumentManager} from "../hooks/documentManager";

export interface WrongWord {wrong: string, suggestions: string[]}

export interface SingleWrongWordProps {
    wrongWord: WrongWord;
    index: number;
    removeWord(wrongWord: string): void;
    setDebug?(message: string): void;
}

export function SingleWrongWord({wrongWord, index, removeWord, setDebug}: SingleWrongWordProps) {
    const firstSuggestion = wrongWord.suggestions[0];
    const weHaveSuggestions = !!firstSuggestion;
    const documentManager = useDocumentManager(setDebug);

    return (
        <tr key={index}>
            <td>
                <DefaultButton
                    split
                    style={{width: "100%", border: "0"}}
                    menuIconProps={{iconName: "__nonExistent__"}}
                    text={wrongWord.wrong}
                    onClick={() => documentManager.jumpToWord(wrongWord.wrong)}
                />
            </td>
            <td>&nbsp;&nbsp;{weHaveSuggestions ? " → " : ""}&nbsp;&nbsp;</td>
            <td>
                {!weHaveSuggestions ?  "" : (
                    <DefaultButton
                        split
                        style={{width: "100%", border: "0"}}
                        menuIconProps={{iconName: "__nonExistent__"}}
                        text={firstSuggestion}
                        menuProps={{
                            items: wrongWord.suggestions.map(suggestion => ({
                                key: suggestion,
                                text: suggestion,
                                onClick: () => documentManager.replaceWord(wrongWord.wrong, suggestion, removeWord),
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
                        onClick={() => documentManager.replaceWord(wrongWord.wrong, firstSuggestion, removeWord)}
                    />
                )}
            </td>
            <td>
                <Button
                    split
                    buttonType={ButtonType.icon}
                    iconProps={{ iconName: "__nonExistent__" }}
                    menuProps={{
                        items: [
                            {
                                key: 'addToPrivateDictionary',
                                text: 'Add to my dictionary',
                                iconProps: { iconName: 'Add' },
                            },
                            {
                                key: 'addToGlobalDictionary',
                                text: 'Propose Word',
                                iconProps: { iconName: 'World' },
                            },
                        ],
                    }}
                />
            </td>
        </tr>
    )
}
