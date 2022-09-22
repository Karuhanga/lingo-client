import * as React from "react";

export interface HeaderProps {
  title: string;
  logo: string;
  message: string;
}

export default class Header extends React.Component<HeaderProps> {
  render() {
    const { title, logo, message } = this.props;

    return (
      <section className="ms-welcome__header ms-bgColor-neutralLighter ms-u-fadeIn500" style={{paddingTop: "15px", paddingBottom: "7.5px"}}>
        <img width="30" height="30" src={logo} alt={title} title={title} />
        <h2 className="ms-fontWeight-semilight ms-fontColor-neutralPrimary">{message}</h2>
      </section>
    );
  }
}
