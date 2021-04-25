/* global Button Header, HeroList, HeroListItem, Progress, Word */
import * as React from "react";
import Header from "./Header";
import WrongWordList from "./WrongWordList";
import Progress from "./Progress";
import {useState} from "react";
import useInterval from "@use-it/interval";
import {PrimaryButton} from "office-ui-fabric-react";

// images references in the manifest
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";
import {WrongWord} from "./SingleWrongWord";
import {useDictionaryManager} from "../hooks/dictionaryManager";
import {useDocumentManager} from "../hooks/documentManager";

export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

export default function App({ title, isOfficeInitialized }: AppProps) {
  const [debug, setDebug] = useState("");

  const [wrongWords, setWrongWords] = useState<WrongWord[]>([]);
  const [checking, setChecking] = useState(false);
  const dictionaryManager = useDictionaryManager();
  const documentManager = useDocumentManager();


  if (!isOfficeInitialized) {
    return (
        <Progress title={title} logo="assets/logo.png" message="Please sideload your addin to see app body." />
    );
  }

  if (!dictionaryManager.weHaveADictionary()) {
    if (dictionaryManager.dictionaryUpdating) {
      return (
          <Progress title="Setting up..." logo="assets/logo.png" message="Downloading your dictionary. This will be a one time thing. Promise 🙃" />
      )
    } else {
      return (
          <div className="ms-welcome">
            <Header logo="assets/logo.png" title={title} message="Spell Checker" />
            <section className="ms-welcome__header ms-bgColor-neutralLighter ms-u-fadeIn500" style={{paddingTop: "15px", paddingBottom: "7.5px"}}>
              <PrimaryButton onClick={dictionaryManager.retryDictionaryDownload}>Retry Dictionary Download</PrimaryButton>
            </section>
          </div>
      )
    }
  }

  function removeWrongWord(wrongWord: string) {
    setWrongWords(wrongWords.filter(word => word.wrong !== wrongWord));
  }

  function runSpellCheck() {
    if (dictionaryManager.weHaveADictionary() && !checking) {
      setChecking(true);
      documentManager.getWords()
          .then(dictionaryManager.checkSpellings)
          .then(newWrongWords => setWrongWords(uniqueWrongWords(newWrongWords)))
          .finally(() => setChecking(false));
    }
  }

  useInterval(() => runSpellCheck(), 5000);
  setDebug(JSON.stringify(dictionaryManager.dictionary));

  return (
      <div className="ms-welcome">
        {debug}
        <Header logo="assets/logo.png" title={title} message="Spell Checker" />
        <WrongWordList
            message="Possible misspellings"
            recheckDisabled={checking}
            recheck={() => runSpellCheck()}
            items={wrongWords}
            removeWord={removeWrongWord}
        />
      </div>
  );
}

function uniqueWrongWords(arr: WrongWord[]) {
  const u = {};
  return arr.filter((v) => {
    return u[v.wrong] = !u.hasOwnProperty(v.wrong);
  });
}
