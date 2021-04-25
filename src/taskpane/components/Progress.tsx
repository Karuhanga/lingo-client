import * as React from "react";
import { Spinner, SpinnerType } from "office-ui-fabric-react";
/* global Spinner */

export interface ProgressProps {
  logo: string;
  message: string;
  title: string;
}

export default class Progress extends React.Component<ProgressProps> {
  render() {
    const { logo, message, title } = this.props;

    return (
        <section className="ms-welcome__header ms-bgColor-neutralLighter ms-u-fadeIn500" style={{paddingTop: "30px", height: "100vh", paddingBottom: "15px"}}>
            <img width="60" height="60" src={logo} alt={title} title={title} />
            <h1 className="ms-fontSize-su ms-fontWeight-light ms-fontColor-neutralPrimary">{title}</h1>
            <Spinner type={SpinnerType.large} label={message} />
        </section>
    );
  }
}
