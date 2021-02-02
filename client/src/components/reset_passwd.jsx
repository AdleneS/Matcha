import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { Redirect } from "react-router";

class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password1: "",
      password2: "",
      err_pass: false,
      redirect: false,
    };
  }

  handlePass1 = async (event) => {
    await this.setState({ password1: event.target.value });
  };

  handlePass2 = async (event) => {
    await this.setState({ password2: event.target.value });
  };

  onSubmit = (event) => {
    event.preventDefault();

    if (this.state.password1 === this.state.password2) {
      const queryString = window.location.search;
      const urlParam = new URLSearchParams(queryString);

      fetch("/email/updatepass", {
        method: "POST",
        body: JSON.stringify({ token: urlParam.get("token"), password: this.state.password1 }),
        headers: {
          "Content-type": "application/json",
        },
      }).then((res) => {
        if (res.status === 400) {
          this.setState({ err_pass: true });
        } else {
          this.setState({ redirect: true });
        }
      });
    }
  };

  render() {
    if (this.state.redirect) {
      return <Redirect to="/Login" />;
    }
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
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              name="passwordOne"
              placeholder="Password"
              onChange={(event) => {
                this.handlePass1(event);
              }}
              value={this.password1}
              required
            />
          </Form.Group>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>Rewrite your password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={this.password2}
              onChange={(event) => {
                this.handlePass2(event);
              }}
              placeholder="Password"
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
        {this.state.err_pass && (
          <Alert key="1" style={{ marginTop: "15px" }} variant="danger">
            {" "}
            Your password doesn't fit our rules{" "}
            <span role="img" aria-label="bad">
              ☹️
            </span>
          </Alert>
        )}
      </div>
    );
  }
}

export default ResetPassword;
