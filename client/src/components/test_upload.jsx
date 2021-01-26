import React, { Component } from "react";

class Test_upload extends Component {
  state = {
    file: null,
  };

  onFileChange = (event) => {
    this.setState({ file: event.target.files[0] });
  };

  onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", this.state.file, this.state.file.name);
    fetch("/imgupload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .catch((error) => {
        throw error;
      });
  };

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

export default Test_upload;
