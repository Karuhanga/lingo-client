import * as React from "react";
import {Button, ButtonType} from "office-ui-fabric-react";
import {SingleWrongWord, WrongWord} from "./SingleWrongWord";

export interface WrongWordListProps {
  message: string;
  items: WrongWord[];
  recheck(): void;
  recheckDisabled: boolean;
  removeWord(wrongWord: string): void;
  setDebug?(message: string): void;
}

export default class WrongWordList extends React.Component<WrongWordListProps> {
  render() {
    const { items, message, recheck, recheckDisabled, removeWord, setDebug } = this.props;

    return (
      <main className="ms-welcome__main">
        <h2 className="ms-font-xl ms-fontWeight-semilight ms-fontColor-neutralPrimary ms-u-slideUpIn20">
            {message}
            &nbsp;
            <Button
                buttonType={ButtonType.icon}
                iconProps={{ iconName: !recheckDisabled ? "Refresh" : "HourGlass" }}
                onClick={recheck}
                disabled={recheckDisabled}
            >
                Recheck
            </Button>
        </h2>
        <table className="ms-font-m ms-fontColor-neutralPrimary">
          {items.map((wrongWord, index) =>
              <SingleWrongWord wrongWord={wrongWord} index={index} removeWord={removeWord} setDebug={setDebug} />
          )}
        </table>
      </main>
    );
  }
}
