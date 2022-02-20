import * as React from "react";
import {Button, ButtonType, DefaultButton} from "office-ui-fabric-react/lib/Button";
import {SingleWrongWord, WrongWordSuggestion} from "./SingleWrongWord";
import {DictionaryManager} from "../hooks/dictionaryManager";

export interface WrongWordListProps {
  message: string;
  items: WrongWordSuggestion[];
  recheck(): void;
  recheckDisabled: boolean;
  removeWord(wrongWord: string): void;
  loadMore();
  dictionaryManager: DictionaryManager;
  showShowMore: boolean;
  setDebug?(message: string): void;
}

export default class WrongWordList extends React.Component<WrongWordListProps> {
  render() {
    const { items, message, recheck, recheckDisabled, removeWord, loadMore, dictionaryManager, showShowMore, setDebug } = this.props;

    return (
      <main className="ms-welcome__main">
        <h2 className="ms-font-xl ms-fontWeight-semilight ms-fontColor-neutralPrimary ms-u-slideUpIn20">
            {message}
            &nbsp;
            <Button
                buttonType={ButtonType.icon}
                iconProps={{ iconName: "Refresh" }}
                onClick={recheck}
                disabled={recheckDisabled}
                // style={{backgroundColor: "transparent"}}
            >
                Recheck
            </Button>
            <Button
                split
                buttonType={ButtonType.icon}
                menuProps={{
                    items: [
                        {
                            key: 'clearLocalDictionary',
                            text: 'Clear My Dictionary',
                            onClick: () => dictionaryManager.clearLocalDictionary(),
                        },
                    ],
                }}
            >
                Menu
            </Button>
        </h2>
        <table className="ms-font-m ms-fontColor-neutralPrimary">
          <tbody>
              {items.map((wrongWord) =>
                  <SingleWrongWord key={wrongWord.wrong} wrongWord={wrongWord} removeWord={removeWord} dictionaryManager={dictionaryManager} setDebug={setDebug} />
              )}
          </tbody>
        </table>
        {(items.length < 1 || !showShowMore) ? null : (
            <DefaultButton
                text="Show more"
                onClick={() => loadMore()}
            />
        )}
      </main>
    );
  }
}
