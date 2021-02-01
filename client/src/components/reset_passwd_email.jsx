import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

class ResetPasswordMail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      err_pass: false,
    };
  }

  handleEmail = async (event) => {
    await this.setState({ email: event.target.value });
  };

  onSubmit = (event) => {
    event.preventDefault();
    fetch("/email/reset", {
      method: "POST",
      body: JSON.stringify({ email: this.state.email }),
      headers: {
        "Content-type": "application/json",
      },
    });
  };

  render() {
    return (
      <div
        style={{
          marginTop: "100px",
          color: "white",
          maxWidth: "25%",
          marginLeft: "auto",
          marginRight: "auto",
          backgroundColor: "rgb(29, 28, 34)",
          padding: "10px",
        }}
      >
        <Form
          onSubmit={(event) => {
            this.onSubmit(event);
          }}
        >
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Email"
              onChange={(event) => {
                this.handleEmail(event);
              }}
              value={this.password1}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </div>
    );
  }
}

export default ResetPasswordMail;
