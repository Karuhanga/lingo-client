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
import {useSpellCheckerService} from "../services/spellChecker";
import {LoadingOverlay} from "./LoadingOverlay";
import {observer} from "mobx-react-lite";
import {useDictionaryService} from "../services/dictionary";

export interface AppProps {
    title: string;
    isOfficeInitialized: boolean;
}
const initialListCount = 20;

const App = observer(({ title, isOfficeInitialized }: AppProps) => {
    const dictionaryService = useDictionaryService();
    const spellChecker = useSpellCheckerService();
    const [showNWords, setShowNWords] = useState(initialListCount);

    if (!isOfficeInitialized) {
        return (
            <Progress title={title} logo="assets/logo.png" message="Just a second..." />
        );
    }

    if (!dictionaryService.isDictionaryAvailable) {
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
        spellChecker.runSpellCheck();
    }, [])

    return (
        <div className="ms-welcome">
            <Header logo="assets/logo.png" title={title} message="LugSpell" />
            <LoadingOverlay loading={spellChecker.isSpellChecking}>
                <WrongWordList
                    message="Possible misspellings"
                    recheckDisabled={spellChecker.isSpellChecking}
                    runCheck={() => {
                        spellChecker.runSpellCheck();
                    }}
                    items={spellChecker.wrongWords.slice(0, showNWords)}
                    removeWrongWord={spellChecker.removeWrongWord}
                    loadMore={() => {
                        setShowNWords(showNWords + 20);
                    }}
                    showShowMore={showNWords < spellChecker.wrongWords.length}
                    dictionaryService={dictionaryService}
                />
            </LoadingOverlay>
        </div>
    );
});


export default App;
