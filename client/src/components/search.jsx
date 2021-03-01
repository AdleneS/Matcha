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
import { FaMapPin } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaTag } from "react-icons/fa";
import { GiAges } from "react-icons/gi";
import InfiniteScroll from "react-infinite-scroller";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);

class Search extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      filtredPretender: [],
      likes: [],
      cookie: {},
      user: {},
      limit: 50,
      offset: 0,
      hasMore: false,
      loading: true,
      timer: null,
      filter: { age: false, location: false, popularity: false, tag: false },
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
      ageValue: [0, 100],
      tagValue: [],
    };
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;

    fetch("/cookie/")
      .then((res) => res.json())
      .then((cookie) => {
        if (this._isMounted) {
          this.setState({ cookie });
        }
      });
    fetch("/users/uid/")
      .then((res) => res.json())
      .then((user) => {
        if (this._isMounted) {
          this.setState({
            user,
          });
        }
      });
    this.setState({ filtredPretender: this.filteringPretender() });
    fetch("/users/likes")
      .then((res) => res.json())
      .then((likes) => {
        if (this._isMounted) {
          this.setState({ likes });
        }
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
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
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
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
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
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
    event.persist();
    this.setState({ timer: clearTimeout(this.state.timer) });
    this.setState({
      timer: setTimeout(() => {
        this.setState({ locationValue: event.target.value });
        this.filteringPretender();
      }, 1000),
    });
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

  handleTag = async (event) => {
    event.persist();
    if (event.target.value === "") {
      this.setState({ tagValue: [] });
    }
    this.setState({ timer: clearTimeout(this.state.timer) });
    this.setState({
      timer: setTimeout(() => {
        this.setState({ tagValue: event.target.value.split(" ") });
        this.filteringPretender();
      }, 1000),
    });
  };

  filteringPretender = () => {
    this.setState({ offset: 0, limit: 50, hasMore: true });
    setTimeout(async () => {
      await fetch("/search/" + this.state.offset + "/" + this.state.limit, {
        method: "POST",
        body: JSON.stringify({
          gender: this.state.genderValue,
          sexual_orientation: this.state.orientationValue,
          age: this.state.ageValue,
          popularity: this.state.popularityValue,
          country: this.state.locationValue,
          tag: this.state.tagValue,
        }),
        headers: {
          "Content-type": "application/json",
        },
      })
        .then((res) =>
          res.json().then((data) => {
            if (data.length >= 50) {
              this.setState({ hasMore: true });
            }
            this.setState({
              filtredPretender: data,
              offset: this.state.offset + 50,
              loading: false,
            });
          })
        )
        .catch((error) => {
          alert(error);
        });
    }, 500);
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
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((res) => {
        if (res.status === 200) {
          const data = {
            notified_uid: pretenderUid,
            notif_type: res.body.info,
          };
          this.props.socket.emit("sendNotif", pretenderUid);
          this.addNotif(data);
          if (res.body.info === "like") this.addMatch(pretenderUid, data);
          else if (res.body.info === "unlike")
            this.deleteMatch(pretenderUid, data);
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

  loadMore = async () => {
    if (this.state.loading) {
      return;
    }
    setTimeout(async () => {
      this.setState({ loading: true });
      await fetch("/search/" + this.state.offset + "/" + this.state.limit, {
        method: "POST",
        body: JSON.stringify({
          gender: this.state.genderValue,
          sexual_orientation: this.state.orientationValue,
          age: this.state.ageValue,
          popularity: this.state.popularityValue,
          country: this.state.locationValue,
          tag: this.state.tagValue,
          filter: this.state.filter,
        }),
        headers: {
          "Content-type": "application/json",
        },
      })
        .then((res) =>
          res.json().then((data) => ({ status: res.status, body: data }))
        )
        .then(async (res) => {
          if (res.status === 200) {
            this.setState({
              offset: this.state.offset + 50,
            });
            this.setState({
              filtredPretender: [...this.state.filtredPretender, ...res.body],
            });
          } else {
            this.setState({ hasMore: false });
          }
        });
      this.setState({ loading: false });
    }, 1000);
  };

  handleFilter = (event) => {
    if (event === "age") {
      if (!this.state.filter.age) {
        this.setState({
          filtredPretender: this.state.filtredPretender.sort((b, a) => {
            return (
              Moment().diff(a.birthday, "years") -
              Moment().diff(b.birthday, "years")
            );
          }),
        });
        this.setState({
          filter: { age: true, location: false, popularity: false, tag: false },
        });
      } else {
        this.filteringPretender();
        this.setState({
          filter: {
            age: false,
            location: false,
            popularity: false,
            tag: false,
          },
        });
      }
    } else if (event === "location") {
      if (!this.state.filter.location) {
        this.setState({
          filtredPretender: this.state.filtredPretender.sort((a, b) => {
            if (a.country.toLowerCase() < b.country.toLowerCase()) {
              return -1;
            }
            if (a.country.toLowerCase() > b.country.toLowerCase()) {
              return 1;
            }
            return 0;
          }),
        });
        this.setState({
          filter: { age: false, location: true, popularity: false, tag: false },
        });
      } else {
        this.filteringPretender();
        this.setState({
          filter: {
            age: false,
            location: false,
            popularity: false,
            tag: false,
          },
        });
      }
    } else if (event === "popularity") {
      if (!this.state.filter.popularity) {
        this.setState({
          filtredPretender: this.state.filtredPretender.sort((b, a) => {
            return a.popularity - b.popularity;
          }),
        });
        this.setState({
          filter: { age: false, location: false, popularity: true, tag: false },
        });
      } else {
        this.filteringPretender();
        this.setState({
          filter: {
            age: false,
            location: false,
            popularity: false,
            tag: false,
          },
        });
      }
    } else if (event === "tag") {
      if (!this.state.filter.tag) {
        this.setState({
          filtredPretender: this.state.filtredPretender.sort((b, a) => {
            return a.tag.length - b.tag.length;
          }),
        });
        this.setState({
          filter: { age: false, location: false, popularity: false, tag: true },
        });
      } else {
        this.filteringPretender();
        this.setState({
          filter: {
            age: false,
            location: false,
            popularity: false,
            tag: false,
          },
        });
      }
    }
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
    position: "relative",
  };

  wrapperStyle = { width: 200, marginLeft: "10px" };
  render() {
    const spin = {
      width: "50px",
      height: "50px",
      marginRight: "auto",
      marginLeft: "auto",
      color: "white !important",
    };
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
              <Form.Control
                as="select"
                onChange={this.handleGender}
                value={genderValue}
                custom
              >
                {gender.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="select" controlId="formOrientation">
              <Form.Label>Sexual Orientation</Form.Label>
              <Form.Control
                as="select"
                onChange={this.handleOrientation}
                value={orientationValue}
                custom
              >
                {orientation.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="select" controlId="formLocation">
              <Form.Label>Location</Form.Label>
              <Form.Control
                onChange={(event) => {
                  this.handleLocation(event);
                }}
                type="text"
                placeholder="Location"
              />
            </Form.Group>

            <Form.Group className="select" controlId="formTag">
              <Form.Label>Tags</Form.Label>
              <Form.Control
                onChange={(event) => this.handleTag(event)}
                type="text"
                placeholder="Tag.. Tag.."
              />
            </Form.Group>

            <Form.Group className="select" controlId="formPopularity">
              <Form.Label>
                Popularity {this.state.popularityValue[0]} -{" "}
                {this.state.popularityValue[1]}
              </Form.Label>
              <Range
                onAfterChange={this.handlePopularity}
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
                onAfterChange={this.handleAge}
                style={this.wrapperStyle}
                min={18}
                max={100}
                defaultValue={[18, 100]}
                tipFormatter={(value) => `${value}`}
              />
            </Form.Group>
            <div style={{ display: "flex" }}>
              <Form.Group controlId="filterAge">
                <GiAges
                  onClick={() => this.handleFilter("age")}
                  style={{ marginLeft: "10px", height: "25px", width: "25px" }}
                ></GiAges>
              </Form.Group>
              <Form.Group controlId="filterLocation">
                <FaMapPin
                  onClick={() => this.handleFilter("location")}
                  style={{ marginLeft: "10px", height: "20px", width: "20px" }}
                ></FaMapPin>
              </Form.Group>
              <Form.Group controlId="filterPopularity">
                <FaHeart
                  onClick={() => this.handleFilter("popularity")}
                  style={{ marginLeft: "10px", height: "20px", width: "20px" }}
                ></FaHeart>
              </Form.Group>
              <Form.Group controlId="filterTag">
                <FaTag
                  onClick={() => this.handleFilter("tag")}
                  style={{ marginLeft: "10px", height: "20px", width: "20px" }}
                ></FaTag>
              </Form.Group>
            </div>
          </Form>
        </div>

        <div style={{ overflow: "hidden" }}>
          <InfiniteScroll
            loadMore={this.loadMore.bind(this)}
            hasMore={this.state.hasMore}
            loader={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px",
                  marginBottom: "10px",
                  color: "white !important",
                }}
                key={0}
                className="text-dark"
              >
                <Spinner style={spin} animation="border" variant="light" />
              </div>
            }
            useWindow={true}
            threshold={250}
          >
            {!this.state.filtredPretender?.length && !this.state.loading && (
              <p style={{ color: "white", width: "301px", margin: "auto" }}>
                We did not find any users with those filters
              </p>
            )}
            <div className="cardContainerSearch fade">
              {this.state.filtredPretender &&
                this.state.filtredPretender.map((pretender, i) => (
                  <Link key={i} to={"profile/?uid=" + pretender.uid}>
                    <Card className="item" key={pretender.id}>
                      <Card.Img
                        className="myPic"
                        variant="top"
                        src={
                          pretender.path[0]
                            ? process.env.PUBLIC_URL + pretender.path[0]
                            : "https://source.unsplash.com/collection/159213/sig=" +
                              i
                        }
                      />
                      <div className="overlay">
                        <Card.Title className="title">
                          {" "}
                          {pretender.login}{" "}
                          <span>
                            {pretender.connected ? (
                              <FaCircle
                                style={{ color: "green", width: "10px" }}
                              />
                            ) : (
                              <FaCircle
                                style={{ color: "red", width: "10px" }}
                              />
                            )}
                          </span>
                        </Card.Title>
                        <Card.Text>
                          {Moment().diff(pretender.birthday, "years")} years old
                          <br></br>
                          {pretender.gender.charAt(0).toUpperCase() +
                            pretender.gender.slice(1)}{" "}
                          {pretender.sexual_orientation
                            .charAt(0)
                            .toUpperCase() +
                            pretender.sexual_orientation.slice(1)}
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
                        <div
                          style={{
                            marginTop: "50px",
                            display: "flex",
                            flexWrap: "wrap",
                          }}
                        >
                          {pretender.tag[0] !== null &&
                            pretender.tag.map(
                              (tag, i) =>
                                i < 6 && (
                                  <div
                                    key={i}
                                    style={{
                                      marginRight: "5px",
                                      maxWidth: "80px",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <Badge pill variant="dark">
                                      {tag}
                                    </Badge>
                                  </div>
                                )
                            )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
            </div>
          </InfiniteScroll>
        </div>
      </div>
    );
  }
}

export default Search;
