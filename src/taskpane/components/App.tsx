/* global Button Header, HeroList, HeroListItem, Progress, Word */
import * as React from "react";
import Header from "./Header";
import WrongWordList from "./WrongWordList";
import Progress from "./Progress";
import {useEffect, useState} from "react";
import useInterval from "@use-it/interval";
import {PrimaryButton} from "office-ui-fabric-react/lib/Button";

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
const initialListCount = 20;

export default function App({ title, isOfficeInitialized }: AppProps) {
  const [count, setCount] = useState(initialListCount);
  const [wrongWords, setWrongWords] = useState<string[]>([]);
  const [wrongWordsWithSuggestions, setWrongWordsWithSuggestions] = useState<WrongWord[]>([]);
  const [checking, setChecking] = useState(false);
  const dictionaryManager = useDictionaryManager();
  const documentManager = useDocumentManager();
  const [autoRefreshOn, setAutoRefresh] = useState(true);

  async function removeWrongWord(wrongWord: string) {
    await setWrongWords(wrongWords.filter(word => word !== wrongWord));
  }

  function runSpellCheck() {
    if (dictionaryManager.weHaveADictionary() && !checking) {
      setChecking(true);

      new Promise((resolve: (result: Promise<string[]>) => void) => {
        requestAnimationFrame(() => resolve(documentManager.getWords()));
      })
      // asyncCheckSpellings if we hit a performance bottleneck. todo: test on 10000 words
      .then(dictionaryManager.checkSpellings)
      .then(newWrongWords => {
        if (autoRefreshOn) setCount(initialListCount);
        setWrongWords(newWrongWords);
      })
      .finally(() => setChecking(false));
    }
  }

  useEffect(() => {
    setWrongWordsWithSuggestions(wrongWords.slice(0, count).map(dictionaryManager.suggestCorrections))
  }, [count, wrongWords]);

  useInterval(() => autoRefreshOn && runSpellCheck(), 15000);

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
            {dictionaryManager.dictionaryUpdating ? "." : ""}
            <section className="ms-welcome__header ms-bgColor-neutralLighter ms-u-fadeIn500" style={{paddingTop: "15px", paddingBottom: "7.5px"}}>
              <PrimaryButton onClick={dictionaryManager.retryDictionaryDownload}>Retry Dictionary Download</PrimaryButton>
            </section>
          </div>
      )
    }
  }

  return (
      <div className="ms-welcome">
        <Header logo="assets/logo.png" title={title} message="Spell Checker" />
        <WrongWordList
            message="Possible misspellings"
            recheckDisabled={checking}
            recheck={() => {
              setAutoRefresh(true);
              runSpellCheck();
            }}
            items={wrongWordsWithSuggestions}
            removeWord={removeWrongWord}
            loadMore={() => {
              setAutoRefresh(false);
              setCount(count + 20);
            }}
            dictionaryManager={dictionaryManager}
        />
      </div>
  );
}

// function uniqueWrongWords(arr: WrongWord[]) {
//   const u = {};
//   return arr.filter((v) => {
//     return u[v.wrong] = !u.hasOwnProperty(v.wrong);
//   });
// }
