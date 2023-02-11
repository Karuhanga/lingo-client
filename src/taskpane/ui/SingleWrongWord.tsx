import {Button, ButtonType, DefaultButton} from "office-ui-fabric-react/lib/Button";
import * as React from "react";
import {useDocumentService} from "../services/document";
import {DictionaryService} from "../services/dictionary";

export interface WrongWordSuggestion {wrong: string, suggestions: string[]}

export interface SingleWrongWordProps {
    word: string;
    removeWrongWord(wrongWord: string): void;
    dictionaryService: DictionaryService;
    setDebug?(message: string): void;
}

export function SingleWrongWord({word, removeWrongWord, dictionaryService, setDebug}: SingleWrongWordProps) {
    const wrongWord = dictionaryService.suggestCorrections(word);
    const firstSuggestion = wrongWord.suggestions[0];
    const weHaveSuggestions = !!firstSuggestion;
    const documentService = useDocumentService(setDebug);

    return (
        <tr>
            <td style={{maxWidth: '100px'}}>
                <DefaultButton
                    split
                    style={{width: "100%", border: "0", overflow: "hidden", textOverflow: "ellipsis"}}
                    menuIconProps={{iconName: "__nonExistent__"}}
                    text={wrongWord.wrong}
                    onClick={() => documentService.jumpToWord(wrongWord.wrong)}
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
                                onClick: () => {documentService.replaceWord(wrongWord.wrong, suggestion).then(() => removeWrongWord(wrongWord.wrong))},
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
                        onClick={() => {documentService.replaceWord(wrongWord.wrong, firstSuggestion).then(() => removeWrongWord(wrongWord.wrong))}}
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
                                    dictionaryService.addWordLocal(wrongWord.wrong);
                                    removeWrongWord(wrongWord.wrong);
                                },
                            },
                            {
                                key: 'addToGlobalDictionary',
                                text: 'Propose Word',
                                disabled: true,
                                iconProps: { iconName: 'World' },
                                onClick: () => {
                                    dictionaryService.addWordGlobal(wrongWord.wrong);
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
