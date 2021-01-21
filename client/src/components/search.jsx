import React, { Component } from "react";
import Moment from "moment";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import "./search.css";
import "./animation.css";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import Form from "react-bootstrap/Form";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { FaCircle } from "react-icons/fa";

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filtredPretender: [],
      likes: [],
      cookie: {},
      user: {},
      gender: [
        {
          name: "All",
          value: "",
        },
        {
          name: "Man",
          value: "man",
        },
        {
          name: "Woman",
          value: "woman",
        },
        {
          name: "Other",
          value: "other",
        },
      ],
      orientation: [
        {
          name: "All",
          value: "",
        },
        {
          name: "Heterosexual",
          value: "heterosexual",
        },
        {
          name: "Homosexual",
          value: "homosexual",
        },
        {
          name: "Bisexual",
          value: "bisexual",
        },
      ],
      genderValue: "",
      orientationValue: "",
      locationValue: "",
      popularityValue: [0, 100],
      ageValue: [18, 100],
    };
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    fetch("/cookie/")
      .then((res) => res.json())
      .then((cookie) => this.setState({ cookie }));
    fetch("/users/uid/")
      .then((res) => res.json())
      .then((user) => {
        this.setState({ user });
      });
    this.setState({ filtredPretender: this.filteringPretender() });
    fetch("/users/likes")
      .then((res) => res.json())
      .then((likes) => this.setState({ likes }));
  }

  addNotif = (data) => {
    fetch("/notif/create", {
      method: "POST",
      body: JSON.stringify({
        notified_uid: data.notified_uid,
        notif_type: data.notif_type,
      }),
      headers: {
        "Content-type": "application/json",
      },
    });
  };

  addMatch = (pretenderUid, data) => {
    fetch("/match/create", {
      method: "POST",
      body: JSON.stringify({ pretenderUid: pretenderUid }),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => res.json().then((data) => ({ status: res.status, body: data })))
      .then((res) => {
        if (res.status === 200) {
          this.updatePopularity();
          if (res.body.info === "match") {
            data.notif_type = "match";
            this.props.socket.emit("sendNotif", pretenderUid);
            this.props.socket.emit("sendNotif", this.state.cookie.uid);
            this.addNotif(data);
          }
        } else {
          const error = new Error(res.body.error);
          throw error;
        }
      })
      .catch((error) => {
        alert(error);
      });
  };

  deleteMatch = (pretenderUid, data) => {
    fetch("/match/delete", {
      method: "POST",
      body: JSON.stringify({ pretenderUid: pretenderUid }),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => res.json().then((data) => ({ status: res.status, body: data })))
      .then((res) => {
        if (res.status === 200) {
          this.updatePopularity();
          if (res.body.info === "unmatch") {
            data.notif_type = "unmatch";
            this.props.socket.emit("sendNotif", pretenderUid);
            this.addNotif(data);
          }
        } else {
          const error = new Error(res.body.error);
          throw error;
        }
      })
      .catch((error) => {
        alert(error);
      });
  };

  updatePopularity = () => {
    fetch("/users/popularity");
  };

  handleGender = async (event) => {
    await this.setState({ genderValue: event.target.value });
    this.filteringPretender();
  };

  handleLocation = async (event) => {
    await this.setState({ locationValue: event.target.value });
    this.filteringPretender();
  };

  handleOrientation = async (event) => {
    await this.setState({ orientationValue: event.target.value });
    this.filteringPretender();
  };

  handlePopularity = async (event) => {
    await this.setState({ popularityValue: event });
    this.filteringPretender();
  };

  handleAge = async (event) => {
    await this.setState({ ageValue: event });
    this.filteringPretender();
  };

  filteringPretender = () => {
    setTimeout(() => {
      fetch("/search", {
        method: "POST",
        body: JSON.stringify({
          gender: this.state.genderValue,
          sexual_orientation: this.state.orientationValue,
          age: this.state.ageValue,
          popularity: this.state.popularityValue,
          country: this.state.locationValue,
        }),
        headers: {
          "Content-type": "application/json",
        },
      })
        .then((res) =>
          res.json().then((data) => {
            this.setState({ filtredPretender: data });
          })
        )
        .catch((error) => {
          alert(error);
        });
    }, 200);
  };

  onClick = (event, pretenderUid) => {
    event.preventDefault();
    fetch("/like/", {
      method: "POST",
      body: JSON.stringify({ likedUid: pretenderUid }),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => res.json().then((data) => ({ status: res.status, body: data })))
      .then((res) => {
        if (res.status === 200) {
          const data = {
            notified_uid: pretenderUid,
            notif_type: res.body.info,
          };
          this.props.socket.emit("sendNotif", pretenderUid);
          this.addNotif(data);
          if (res.body.info === "like") this.addMatch(pretenderUid, data);
          else if (res.body.info === "unlike") this.deleteMatch(pretenderUid, data);
          fetch("/users/likes")
            .then((res) => res.json())
            .then((likes) => this.setState({ likes }));
        } else {
          const error = new Error(res.body.error);
          throw error;
        }
      })
      .catch((error) => {
        alert(error);
      });
  };

  navBarStyle = {
    width: "100%",
    marginTop: "77px",
    marginBottom: "77px",
    minHeight: "77px",
    zIndex: 1,
    color: "white",
    backgroundColor: "#27262e",
    display: "flex",
    alignItems: "center",
    position: "fixed",
  };

  wrapperStyle = { width: 200, marginLeft: "10px" };

  render() {
    const { gender, genderValue, orientation, orientationValue } = this.state;
    Moment.locale("fr");
    return (
      <div>
        <div style={this.navBarStyle} className="fixed-top">
          <Form
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              flexWrap: "wrap",
              alignItems: "center",
              padding: "8px",
            }}
          >
            <Form.Group className="select" controlId="formGender">
              <Form.Label>Gender</Form.Label>
              <Form.Control as="select" onChange={this.handleGender} value={genderValue} custom>
                {gender.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="select" controlId="formOrientation">
              <Form.Label>Sexual Orientation</Form.Label>
              <Form.Control as="select" onChange={this.handleOrientation} value={orientationValue} custom>
                {orientation.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="select" controlId="formLocation">
              <Form.Label>Location</Form.Label>
              <Form.Control onChange={this.handleLocation} type="text" placeholder="Location" />
            </Form.Group>

            <Form.Group className="select" controlId="formPopularity">
              <Form.Label>
                Popularity {this.state.popularityValue[0]} - {this.state.popularityValue[1]}
              </Form.Label>
              <Range
                onChange={this.handlePopularity}
                style={this.wrapperStyle}
                min={0}
                max={100}
                defaultValue={[0, 100]}
                tipFormatter={(value) => `${value}`}
              />
            </Form.Group>

            <Form.Group className="select" controlId="formAge">
              <Form.Label>
                Age {this.state.ageValue[0]} - {this.state.ageValue[1]}
              </Form.Label>
              <Range
                onChange={this.handleAge}
                style={this.wrapperStyle}
                min={18}
                max={100}
                defaultValue={[18, 100]}
                tipFormatter={(value) => `${value}`}
              />
            </Form.Group>
          </Form>
        </div>
        <div style={{ color: "red" }}></div>
        <div className="cardContainerSearch fade">
          {this.state.filtredPretender &&
            this.state.filtredPretender.map((pretender, i) => (
              <Link key={i} to={"profile/?uid=" + pretender.uid}>
                <Card className="item" key={pretender.id}>
                  <Card.Img className="myPic" variant="top" src={process.env.PUBLIC_URL + pretender.path} />
                  <div className="overlay">
                    <Card.Title className="title">
                      {" "}
                      {pretender.login}{" "}
                      <span>
                        {pretender.connected ? (
                          <FaCircle style={{ color: "green", width: "10px" }} />
                        ) : (
                          <FaCircle style={{ color: "red", width: "10px" }} />
                        )}
                      </span>
                    </Card.Title>
                    <Card.Text>
                      {Moment().diff(pretender.birthday, "years")} years old
                      <br></br>
                      {pretender.gender.charAt(0).toUpperCase() + pretender.gender.slice(1)}{" "}
                      {pretender.sexual_orientation.charAt(0).toUpperCase() + pretender.sexual_orientation.slice(1)}
                      <br></br>
                      Popularity: {pretender.popularity}
                      <br></br>
                      Location: {pretender.country}
                    </Card.Text>
                    {this.state.likes.map((likes) => (
                      <Card.Text key={likes.id}>
                        {" "}
                        {likes.uid_liked === pretender.uid ? (
                          <BsHeartFill
                            onClick={(event) => {
                              this.onClick(event, pretender.uid);
                            }}
                            style={{
                              color: "#ff3333",
                              width: "30px",
                              height: "30px",
                              position: "absolute",
                            }}
                          />
                        ) : null}
                      </Card.Text>
                    ))}
                    <BsHeart
                      onClick={(event) => {
                        this.onClick(event, pretender.uid);
                      }}
                      style={{
                        color: "#ff3333",
                        width: "30px",
                        height: "30px",
                        position: "absolute",
                      }}
                    />
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      </div>
    );
  }
}

export default Search;
