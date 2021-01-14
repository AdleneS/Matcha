import React, { Component } from "react";
import Moment from "moment";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import "./search.css";
import "./animation.css";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { gender, orientation } from "../enum/genderOrientation.js";
import Form from "react-bootstrap/Form";

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pretender: [],
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
    fetch("/pretender/")
      .then((res) => res.json())
      .then((pretender) => {
        this.setState({ pretender });
        this.setState({ filtredPretender: pretender });
      });
    fetch("/users/likes")
      .then((res) => res.json())
      .then((likes) => this.setState({ likes }));
  }

  addNotif = (data) => {
    fetch("/notif/create", {
      method: "POST",
      body: JSON.stringify({
        notified_uid: data.notified_uid,
        notifier_uid: data.notifier_uid,
        notifier_login: data.notifier_login,
        notif_type: data.notif_type,
      }),
      headers: {
        "Content-type": "application/json",
      },
    });
  };

  filterPretender = (pretender) => {
    if (this.state.user[0].sexual_orientation === orientation.bi || this.state.user[0].gender === gender.other) {
      return pretender;
    } else if (this.state.user[0].gender === gender.man) {
      if (this.state.user[0].sexual_orientation === orientation.hetero) {
        return pretender.filter(
          (pretender) =>
            (pretender.gender === gender.woman || pretender.gender === gender.other) &&
            (pretender.sexual_orientation === orientation.hetero || pretender.sexual_orientation === orientation.bi)
        );
      } else if (this.state.user[0].sexual_orientation === orientation.homo) {
        return pretender.filter(
          (pretender) =>
            (pretender.gender === gender.man || pretender.gender === gender.other) &&
            (pretender.sexual_orientation === orientation.homo || pretender.sexual_orientation === orientation.bi)
        );
      }
    } else if (this.state.user[0].gender === gender.woman) {
      if (this.state.user[0].sexual_orientation === orientation.hetero) {
        return pretender.filter(
          (pretender) =>
            (pretender.gender === gender.man || pretender.gender === gender.other) &&
            (pretender.sexual_orientation === orientation.hetero || pretender.sexual_orientation === orientation.bi)
        );
      } else if (this.state.user[0].sexual_orientation === orientation.homo) {
        return pretender.filter(
          (pretender) =>
            (pretender.gender === gender.woman || pretender.gender === gender.other) &&
            (pretender.sexual_orientation === orientation.homo || pretender.sexual_orientation === orientation.bi)
        );
      }
    }
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

  handleOrientation = async (event) => {
    await this.setState({ orientationValue: event.target.value });
    this.filteringPretender();
  };

  filteringPretender = () => {
    let filter = this.state.pretender;
    if (this.state.genderValue) {
      filter = filter.filter((pretender) => pretender.gender === this.state.genderValue);
    }
    if (this.state.orientationValue) {
      filter = filter.filter((pretender) => pretender.sexual_orientation === this.state.orientationValue);
    }
    this.setState({
      filtredPretender: filter,
    });
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
            notifier_uid: this.state.cookie.info.uid,
            notified_uid: pretenderUid,
            notifier_login: this.state.cookie.info.login,
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
    minHeight: "77px",
    zIndex: 1,
    color: "white",
    backgroundColor: "#27262e",
    display: "flex",
    alignItems: "center",
  };

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
            <Form.Group className="select" controlId="exampleForm.SelectCustom">
              <Form.Label>Gender</Form.Label>
              <Form.Control as="select" onChange={this.handleGender} value={genderValue} custom>
                {gender.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="select" controlId="exampleForm.SelectCustom">
              <Form.Label>Sexual Orientation</Form.Label>
              <Form.Control as="select" onChange={this.handleOrientation} value={orientationValue} custom>
                {orientation.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </div>
        <div style={{ color: "red" }}></div>
        <div className="cardContainerSearch fade">
          {this.state.filtredPretender &&
            this.state.filtredPretender.map((pretender) => (
              <Link key={pretender.id} to={"profile/?uid=" + pretender.uid}>
                <Card className="item" key={pretender.id}>
                  <Card.Img className="myPic" variant="top" src={process.env.PUBLIC_URL + pretender.path} />
                  <div className="overlay">
                    <Card.Title className="title">{pretender.login}</Card.Title>
                    <Card.Text>
                      {Moment().diff(pretender.birthday, "years")} years old
                      <br></br>
                      {pretender.gender.charAt(0).toUpperCase() + pretender.gender.slice(1)}{" "}
                      {pretender.sexual_orientation.charAt(0).toUpperCase() + pretender.sexual_orientation.slice(1)}
                      <br></br>
                      Popularity: {pretender.popularity}
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
