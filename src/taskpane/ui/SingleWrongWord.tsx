import {Button, ButtonType, DefaultButton} from "office-ui-fabric-react/lib/Button";
import * as React from "react";
import {useDocumentService} from "../services/document";
import {DictionaryService} from "../services/dictionary";
import {onTimeWindow} from "../utils/asyncUtils";

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
    const [isLoading, setIsLoading] = React.useState(false);

    return (
        <tr>
            <td style={{maxWidth: '100px'}}>
                <DefaultButton
                    split
                    style={{width: "100%", border: "0", overflow: "hidden", textOverflow: "ellipsis"}}
                    menuIconProps={{iconName: "__nonExistent__"}}
                    text={wrongWord.wrong}
                    onClick={() => {
                        setIsLoading(true);
                        documentService.jumpToWord(wrongWord.wrong);
                        setIsLoading(false);
                    }}
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
                                onClick: () => {
                                    setIsLoading(true);
                                    documentService.replaceWord(wrongWord.wrong, suggestion).then(() => removeWrongWord(wrongWord.wrong)).finally(() => setIsLoading(false));
                                },
                            })),
                        }}
                    />
                )}
            </td>
            <td>
                {!isLoading ? null : (
                    <Button
                        buttonType={ButtonType.icon}
                        iconProps={{iconName: "ProgressRingDots"}}
                        />
                )}
                {isLoading || !weHaveSuggestions ? null : (
                    <Button
                        buttonType={ButtonType.icon}
                        iconProps={{ iconName: "CheckMark" }}
                        onClick={() => {
                            setIsLoading(true);
                            documentService.replaceWord(wrongWord.wrong, firstSuggestion).then(() => removeWrongWord(wrongWord.wrong)).finally(() => setIsLoading(false));
                        }}
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
                                    setIsLoading(true);
                                    onTimeWindow(() => {
                                        dictionaryService.addWordLocal(wrongWord.wrong);
                                        removeWrongWord(wrongWord.wrong);
                                    }).finally(() => setIsLoading(false));
                                },
                            },
                            {
                                key: 'addToGlobalDictionary',
                                text: 'Propose Word',
                                disabled: true,
                                iconProps: { iconName: 'World' },
                                onClick: () => {
                                    setIsLoading(true);
                                    onTimeWindow(() => {
                                        dictionaryService.addWordGlobal(wrongWord.wrong);
                                        removeWrongWord(wrongWord.wrong);
                                    }).finally(() => setIsLoading(false));
                                }
                            },
                        ],
                    }}
                />
            </td>
        </tr>
    )
}
