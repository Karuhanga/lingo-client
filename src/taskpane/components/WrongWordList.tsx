import * as React from "react";
import {Button, ButtonType, DefaultButton} from "office-ui-fabric-react/lib/Button";
import {SingleWrongWord, WrongWord} from "./SingleWrongWord";
import {DictionaryManager} from "../hooks/dictionaryManager";

export interface WrongWordListProps {
  message: string;
  items: WrongWord[];
  recheck(): void;
  recheckDisabled: boolean;
  removeWord(wrongWord: string): void;
  loadMore();
  dictionaryManager: DictionaryManager;
  setDebug?(message: string): void;
}

export default class WrongWordList extends React.Component<WrongWordListProps> {
  render() {
    const { items, message, recheck, recheckDisabled, removeWord, loadMore, dictionaryManager, setDebug } = this.props;

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
                style={{backgroundColor: "transparent"}}
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
              {items.map((wrongWord, index) =>
                  <SingleWrongWord key={index} wrongWord={wrongWord} index={index} removeWord={removeWord} dictionaryManager={dictionaryManager} setDebug={setDebug} />
              )}
          </tbody>
        </table>
        {items.length < 1 ? null : (
            <DefaultButton
                text="Show more"
                onClick={() => loadMore()}
            />
        )}
      </main>
    );
  }
}
