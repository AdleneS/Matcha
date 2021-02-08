import React, { useState, useContext, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import MyContext from "./appcontext";
import { Link, useHistory } from "react-router-dom";

export default function Login(props) {
  const [sValue, setValue] = useState({ email: "", password: "" });

  const { islogged, setIsLogged } = useContext(MyContext);
  let history = useHistory();
  const setIsLoggedTrue = () => {
    setIsLogged(true);
  };

  useEffect(() => {
    if (islogged) {
      history.push("/home");
    }
  }, [islogged, history]);

  const handleInputChange = (event) => {
    const { value, name } = event.target;
    setValue({ ...sValue, [name]: value });
  };

  const onSubmit = async (event, socket) => {
    event.preventDefault();
    await fetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(sValue),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => res.json().then((data) => ({ status: res.status, body: data })))
      .then((res) => {
        if (res.status === 200) {
          props.socket.emit("FromAPI", res.body.uid);
          setIsLoggedTrue();
        } else {
          const error = new Error(res.body.error);
          throw error;
        }
      })
      .catch((err) => {
        alert(err);
      });
  };

  const divLog = {
    width: "350px",
    height: "300px",
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    borderRadius: "5px",
    padding: "9px",
    color: "white",
    margin: "Auto",
    marginTop: "100px",
  };

  return (
    <div style={divLog}>
      <Form
        onSubmit={(event) => {
          onSubmit(event);
        }}
      >
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            onChange={(event) => {
              handleInputChange(event);
            }}
            value={sValue.email}
            required
          />
          <Form.Text className="text-muted">We'll never share your email with anyone else.</Form.Text>
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={sValue.password}
            onChange={(event) => {
              handleInputChange(event);
            }}
            placeholder="Password"
            required
          />
        </Form.Group>
        <Link style={{ color: "white" }} to="/reset/password/email">
          Reset password
        </Link>
        <br />
        <Button style={{ marginTop: "25px", width: "100%" }} variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
}
