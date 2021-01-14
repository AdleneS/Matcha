import React, { Component } from "react";

class confirm_email extends Component {
  state = {};

  componentDidMount() {
    fetch("/profile/report/", {
      method: "POST",
      body: JSON.stringify({ uidUser: this.state.user[0].uid }),
      headers: {
        "Content-type": "application/json",
      },
    });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit} style={{ paddingTop: "90px" }}>
          <input type="file" name="file" onChange={this.onFileChange} />
          <input type="submit" />
        </form>
      </div>
    );
  }
}

export default confirm_email;
