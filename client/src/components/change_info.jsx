import React, { Component } from "react";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Image from "react-bootstrap/Image";
import Moment from "moment";

import "./change_info.css";

class ChangeInfo extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      file: null,
      tmp_file: null,
      login: "",
      email: "",
      name: "",
      surname: "",
      birthday: "",
      gender: "",
      sexual_orientation: "",
      description: "",
      addTag: "",
      location: "",
      tag: [],
      image: [],
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;

    fetch("/change/sortImage")
      .then((response) => response.json())
      .then((image) => {
        if (this._isMounted) {
          this.setState({ image });
        }
      });
    fetch("/users/uid/")
      .then((res) => res.json())
      .then((res) => {
        if (!res[0]) {
          this.props.history.push("/login");
        } else if (this._isMounted) {
          this.setState({
            login: res[0].login,
            email: res[0].email,
            name: res[0].name,
            surname: res[0].firstname,
            birthday: Moment(res[0].birthday).format("YYYY-MM-DD"),
            gender: res[0].gender.charAt(0).toUpperCase() + res[0].gender.slice(1),
            sexual_orientation: res[0].sexual_orientation.charAt(0).toUpperCase() + res[0].sexual_orientation.slice(1),
            description: res[0].description,
            location: res[0].country,
            tag: res[0].tag,
          });
        }
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onClickImg = (event, image) => {
    event.preventDefault();
    fetch("/change/deleteImage", {
      method: "POST",
      body: JSON.stringify({ img: image }),
      headers: {
        "Content-type": "application/json",
      },
    }).then((response) => response.json());
    fetch("/change/sortImage")
      .then((response) => response.json())
      .then((image) => this.setState({ image }));
  };

  onClick = (event, tag_delete) => {
    event.preventDefault();
    fetch("change/deleteTag", {
      method: "POST",
      body: JSON.stringify({ tag: tag_delete }),
      headers: {
        "Content-type": "application/json",
      },
    }).then((response) => response.json());
    fetch("/users/uid/")
      .then((res) => res.json())
      .then((res) => {
        this.setState({
          tag: res[0].tag,
        });
      });
  };

  handleInputChange = (event) => {
    event.preventDefault();
    const name = event.target.name;
    this.setState({ [name]: event.target.value });
  };

  onFileChange = (event) => {
    event.preventDefault();
    this.setState({ file: event.target.files[0] }, () => {
      if (this.state.file) {
        this.setState({ tmp_file: URL.createObjectURL(this.state.file) });
      }
    });
  };

  onSubmit = (e) => {
    e.preventDefault();
    if (this.state.file) {
      const formData = new FormData();
      formData.append("file", this.state.file, this.state.file.name);
      fetch("/imgupload", {
        method: "POST",
        body: formData,
      }).then((response) => response.json());
    }
    fetch("/change/login", {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: {
        "Content-type": "application/json",
      },
    }).then((response) => response.json().then((data) => ({ status: response.status, body: data })));
    fetch("/change/sortImage")
      .then((response) => response.json())
      .then((image) => this.setState({ image }));
    fetch("/users/uid/")
      .then((res) => res.json())
      .then((res) => {
        this.setState({
          tag: res[0].tag,
        });
      });
  };

  render() {
    return (
      <div>
        <div className="container containerChange">
          {this.props.location.state?.alert ? (
            <Alert variant="primary">
              <Alert.Heading>Hey, nice to see you</Alert.Heading>
              <p>You have to add a profil picture to access the home page</p>
            </Alert>
          ) : null}
          <form onSubmit={this.onSubmit}>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={this.state.name}
                  placeholder="change your name"
                  onChange={(event) => {
                    this.handleInputChange(event);
                  }}
                ></Form.Control>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="surname"
                  value={this.state.surname}
                  placeholder="change your surname"
                  onChange={(event) => {
                    this.handleInputChange(event);
                  }}
                ></Form.Control>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>Login</Form.Label>
                <Form.Control
                  type="text"
                  name="login"
                  value={this.state.login}
                  onChange={(event) => {
                    this.handleInputChange(event);
                  }}
                  placeholder="change your login"
                ></Form.Control>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={this.state.email}
                  onChange={(event) => {
                    this.handleInputChange(event);
                  }}
                  placeholder="change your email"
                ></Form.Control>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={this.state.location}
                  onChange={(event) => {
                    this.handleInputChange(event);
                  }}
                  placeholder="change your location"
                ></Form.Control>
              </Form.Group>
            </Form.Row>
            <Form.Group controlId="birthday">
              <Form.Label>Birthday</Form.Label>
              <Form.Control
                type="date"
                value={this.state.birthday}
                placeholder="Enter email"
                onChange={(event) => {
                  this.handleInputChange(event);
                }}
                name="birthday"
              />
            </Form.Group>
            <Form.Row>
              <Form.Group as={Col} controlId="gender">
                <Form.Label>Gender</Form.Label>
                <Form.Control
                  as="select"
                  custom
                  name="gender"
                  value={this.state.gender}
                  onChange={(event) => {
                    this.handleInputChange(event);
                  }}
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
                  value={this.state.sexual_orientation}
                  onChange={(event) => {
                    this.handleInputChange(event);
                  }}
                >
                  <option>Heterosexual</option>
                  <option>Homosexual</option>
                  <option>Bisexual</option>
                </Form.Control>
              </Form.Group>
            </Form.Row>
            <Form.Group controlId="exampleForm.ControlTextarea1">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows="3"
                name="description"
                value={this.state.description ? this.state.description : ""}
                onChange={(event) => {
                  this.handleInputChange(event);
                }}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Tag</Form.Label>
              <Form.Control
                type="text"
                name="addTag"
                onChange={(event) => {
                  this.handleInputChange(event);
                }}
                placeholder="add interest tag"
              />
            </Form.Group>

            <div style={{ marginBot: "50px" }}>
              {this.state.tag.map((tag, i) => (
                <h5 key={i} style={{ display: "inline-block", marginRight: "5px" }}>
                  <Badge
                    pill
                    variant="dark"
                    onClick={(event) => {
                      this.onClick(event, tag);
                    }}
                  >
                    {tag}
                  </Badge>
                </h5>
              ))}
            </div>

            <Form.Group className="fileInput">
              <Form.File
                className="fileInput"
                id="custom-file-translate-scss"
                name="file"
                type="file"
                label="Custom file input"
                lang="en"
                onChange={this.onFileChange}
                custom
              />
            </Form.Group>

            <Form.Group>
              {this.state.image.map((image) => (
                <div key={image.id} className="thumbnail">
                  <Image
                    src={process.env.PUBLIC_URL + image.path}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "200px",
                    }}
                    onClick={(event) => {
                      this.onClickImg(event, image.n_pic);
                    }}
                    rounded
                  />
                </div>
              ))}
              {!this.state.tmp_file ? null : (
                <div className="thumbnail">
                  <Image
                    src={this.state.tmp_file}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "200px",
                    }}
                    rounded
                  />
                </div>
              )}
            </Form.Group>
            <Button
              variant="dark"
              type="submit"
              size="lg"
              className="submitChange"
              block
              style={{ marginBottom: "20px" }}
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    );
  }
}

export default ChangeInfo;
