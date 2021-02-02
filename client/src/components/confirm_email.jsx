import React, { Component } from "react";

class ConfirmEmail extends Component {
  state = {};

  componentDidMount() {
    const queryString = window.location.search;
    const urlParam = new URLSearchParams(queryString);
    fetch("/email/confirm", {
      method: "POST",
      body: JSON.stringify({ token: urlParam.get("token") }),
      headers: {
        "Content-type": "application/json",
      },
    });
  }

  render() {
    return (
      <div style={{ marginTop: "200px" }}>
        <p>cet email a ete confirm</p>
      </div>
    );
  }
}

export default ConfirmEmail;
