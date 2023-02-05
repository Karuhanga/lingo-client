/* global Button Header, HeroList, HeroListItem, Progress, Word */
import * as React from "react";

import Header from "./Header";
import WrongWordList from "./WrongWordList";
import Progress from "./Progress";
import {useState} from "react";
import {PrimaryButton} from "office-ui-fabric-react/lib/Button";

// images references in the manifest
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-64.png";
import "../../../assets/icon-80.png";
import {useSpellChecker} from "./spellChecker";
import {LoadingOverlay} from "./LoadingOverlay";
import {dictionaryService} from "../services/dictionary";
import {observer} from "mobx-react-lite";

export interface AppProps {
    title: string;
    isOfficeInitialized: boolean;
}
const initialListCount = 20;

const App = observer(({ title, isOfficeInitialized }: AppProps) => {
    const [showNWords, setShowNWords] = useState(initialListCount);
    const {isSpellChecking, removeWrongWord, wrongWords, runSpellCheck} = useSpellChecker();

    if (!isOfficeInitialized) {
        return (
            <Progress title={title} logo="assets/logo.png" message="Just a second..." />
        );
    }

    if (!dictionaryService.weHaveADictionary) {
        if (dictionaryService.isDictionaryUpdating) {
            return (
                <Progress title="Setting up..." logo="assets/logo.png" message="Loading dictionary..." />
            )
        } else {
            return (
                <div className="ms-welcome">
                    <Header logo="assets/logo.png" title={title} message="LugSpell" />
                    {dictionaryService.isDictionaryUpdating ? "." : ""}
                    <section className="ms-welcome__header ms-bgColor-neutralLighter ms-u-fadeIn500" style={{paddingTop: "15px", paddingBottom: "7.5px"}}>
                        <PrimaryButton onClick={dictionaryService.retryDictionaryDownload}>Retry Dictionary Load</PrimaryButton>
                    </section>
                </div>
            )
        }
    }

    React.useEffect(() => {
        // run spell check on load
        runSpellCheck();
    }, [])

    return (
        <div className="ms-welcome">
            <Header logo="assets/logo.png" title={title} message="LugSpell" />
            <LoadingOverlay loading={isSpellChecking}>
                <WrongWordList
                    message="Possible misspellings"
                    recheckDisabled={isSpellChecking}
                    runCheck={() => {
                        runSpellCheck();
                    }}
                    items={wrongWords.slice(0, showNWords)}
                    removeWrongWord={removeWrongWord}
                    loadMore={() => {
                        setShowNWords(showNWords + 20);
                    }}
                    showShowMore={showNWords < wrongWords.length}
                    dictionaryService={dictionaryService}
                />
            </LoadingOverlay>
        </div>
    );
});


export default App;
