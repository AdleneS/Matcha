import React, { useState, useContext } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import MyContext from "./appcontext";
import Col from "react-bootstrap/Col";
import { useHistory, Redirect } from "react-router-dom";
import "./animation.css";

export default function Register() {
  const [sValue, setValue] = useState({
    login: "",
    email: "",
    password: "",
    verify_password: "",
    birthday: "",
    firstname: "",
    name: "",
    gender: "man",
    sexual_orientation: "heterosexual",
  });
  const [sError, setError] = useState({
    err_same_login: false,
    err_same_email: false,
    err_login: false,
    err_email: false,
    err_pass: false,
    err_vpass: false,
    err_birth: false,
  });
  const { islogged } = useContext(MyContext);

  const handleInputChange = (event) => {
    const { value, name } = event.target;
    setValue({ ...sValue, [name]: value });
    setError({
      ...sError,
      err_same_login: false,
      err_same_email: false,
      err_login: false,
      err_email: false,
      err_pass: false,
      err_vpass: false,
      err_birth: false,
    });
  };

  let history = useHistory();
  const onSubmit = (event) => {
    event.preventDefault();
    fetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(sValue),
      headers: { "Content-type": "application/json" },
    })
      .then((res) => res.json().then((data) => ({ status: res.status, body: data })))
      .then((res) => {
        if (res.status === 200) {
          history.push("/login");
        } else {
          if (res.body.error.constraint === "login") setError({ ...sError, err_same_login: true });
          if (res.body.error.constraint === "email") setError({ ...sError, err_same_email: true });
          if (res.body.error === "pass") setError({ ...sError, err_pass: true });
          if (res.body.error === "v_pass") setError({ ...sError, err_vpass: true });
          if (res.body.error === "email") setError({ ...sError, err_email: true });
          if (res.body.error === "login") setError({ ...sError, err_login: true });
          if (res.body.error === "birthday") setError({ ...sError, err_birth: true });
          const error = new Error(res.body.error);
          throw error;
        }
      })
      .catch((err) => {});
  };

  const divReg = {
    width: "600px",
    backgroundColor: "#1a1a1a",
    padding: "9px",
    display: "flex",
    flexDirection: "column",
    color: "white",
    borderBottom: "1px solid #111111",
    margin: "Auto",
    marginTop: "90px",
  };

  if (islogged) {
    return <Redirect to="/Home" />;
  }
  return (
    <div style={divReg} className="fade">
      <Form
        onSubmit={(event) => {
          onSubmit(event);
        }}
      >
        <Form.Row>
          <Form.Group as={Col} controlId="login">
            <Form.Label>Login</Form.Label>
            <Form.Control
              type="text"
              placeholder="Login"
              name="login"
              className={sError.err_login || sError.err_same_login ? "shake" : ""}
              onChange={(event) => {
                handleInputChange(event);
              }}
              value={sValue.login}
            />
          </Form.Group>
          <Form.Group as={Col} controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Email"
              name="email"
              className={sError.err_email || sError.err_same_email ? "shake" : ""}
              onChange={(event) => {
                handleInputChange(event);
              }}
              value={sValue.email}
            />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} controlId="firstname">
            <Form.Label>Firstname</Form.Label>
            <Form.Control
              type="text"
              placeholder="Firstname"
              name="firstname"
              className={sError.err_login || sError.err_same_login ? "shake" : ""}
              onChange={(event) => {
                handleInputChange(event);
              }}
              value={sValue.firstname}
            />
          </Form.Group>
          <Form.Group as={Col} controlId="name">
            <Form.Label>Lastname</Form.Label>
            <Form.Control
              type="text"
              placeholder="Lastname"
              name="name"
              className={sError.err_login || sError.err_same_login ? "shake" : ""}
              onChange={(event) => {
                handleInputChange(event);
              }}
              value={sValue.name}
            />
          </Form.Group>
        </Form.Row>
        <Form.Group controlId="birthday">
          <Form.Label>Birthday</Form.Label>
          <Form.Control
            type="date"
            placeholder="Enter email"
            name="birthday"
            className={sError.err_birth ? "shake" : ""}
            onChange={(event) => {
              handleInputChange(event);
            }}
            value={sValue.birthday}
          />
        </Form.Group>
        <Form.Row>
          <Form.Group as={Col} controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              name="password"
              className={sError.err_pass || sError.err_vpass ? "shake" : ""}
              onChange={(event) => {
                handleInputChange(event);
              }}
              value={sValue.password}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="verify_password">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              name="verify_password"
              className={sError.err_pass || sError.err_vpass ? "shake" : ""}
              onChange={(event) => {
                handleInputChange(event);
              }}
              value={sValue.verify_password}
            />
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group as={Col} controlId="gender">
            <Form.Label>Gender</Form.Label>
            <Form.Control
              as="select"
              custom
              name="gender"
              onChange={(event) => {
                handleInputChange(event);
              }}
              value={sValue.gender}
            >
              <option>Man</option>
              <option>Woman</option>
              <option>Other</option>
            </Form.Control>
          </Form.Group>

          <Form.Group as={Col} controlId="sexual_orientation">
            <Form.Label>Sexual Orientation</Form.Label>
            <Form.Control
              as="select"
              custom
              name="sexual_orientation"
              onChange={(event) => {
                handleInputChange(event);
              }}
              value={sValue.sexual_orientation}
            >
              <option>Heterosexual</option>
              <option>Homosexual</option>
              <option>Bisexual</option>
            </Form.Control>
          </Form.Group>
        </Form.Row>
        <Button
          style={{ width: "100%", backgroundColor: "#31303a", borderColor: "#31303a" }}
          variant="primary"
          type="submit"
        >
          Submit
        </Button>
      </Form>

      {sError.err_login && (
        <Alert key="1" style={{ marginTop: "15px" }} variant="danger">
          {" "}
          Your login must be between 5-12 characters{" "}
          <span role="img" aria-label="bad">
            ☹️
          </span>{" "}
        </Alert>
      )}
      {sError.err_email && (
        <Alert key="1" style={{ marginTop: "15px" }} variant="danger">
          {" "}
          Your email is not good{" "}
          <span role="img" aria-label="bad">
            ☹️
          </span>{" "}
        </Alert>
      )}
      {sError.err_same_email && (
        <Alert key="1" style={{ marginTop: "15px" }} variant="warning">
          {" "}
          This email is already used{" "}
          <span role="img" aria-label="oups">
            😵
          </span>
        </Alert>
      )}
      {sError.err_same_login && (
        <Alert key="1" style={{ marginTop: "15px" }} variant="warning">
          {" "}
          This login is already used{" "}
          <span role="img" aria-label="oups">
            😵
          </span>
        </Alert>
      )}
      {sError.err_vpass && (
        <Alert key="1" style={{ marginTop: "15px" }} variant="danger">
          {" "}
          Watchout your password is not the same{" "}
          <span role="img" aria-label="nope">
            🤐
          </span>
        </Alert>
      )}
      {sError.err_pass && (
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
