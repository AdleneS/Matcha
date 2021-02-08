import React, { Component } from "react";
import Moment from "moment";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import "./home.scss";
import "./animation.css";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { FaCircle } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroller";
import { FaMapPin } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaTag } from "react-icons/fa";
import { GiAges } from "react-icons/gi";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pretender: [],
      likes: [],
      cookie: {},
      user: {},
      limit: 50,
      offset: 0,
      hasMore: true,
      loading: true,
      filter: { age: false, location: false, popularity: false, tag: false },
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
    fetch("/pretender/" + this.state.offset + "/" + this.state.limit)
      .then((res) => res.json())
      .then((pretender) => {
        this.setState({
          pretender,
          offset: this.state.offset + 50,
          loading: false,
        });
      });
    fetch("/users/likes")
      .then((res) => res.json())
      .then((likes) => this.setState({ likes }));
    this.setState({ isMounted: true });
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
        throw error;
      });
  };

  loadMore = async () => {
    if (this.state.loading) {
      return;
    }
    setTimeout(async () => {
      this.setState({ loading: true });
      await fetch("/pretender/" + this.state.offset + "/" + this.state.limit)
        .then((res) => res.json().then((data) => ({ status: res.status, body: data })))
        .then(async (res) => {
          this.setState({
            offset: this.state.offset + 50,
          });
          if (res.status === 200) {
            this.setState({
              pretender: [...this.state.pretender, ...res.body],
            });
          } else {
            this.setState({ hasMore: false });
          }
        });
      this.setState({ loading: false });
    }, 300);
  };

  handleFilter = (event) => {
    if (event === "age") {
      if (!this.state.filter.age) {
        this.setState({
          pretender: this.state.pretender.sort((b, a) => {
            return Moment().diff(a.birthday, "years") - Moment().diff(b.birthday, "years");
          }),
        });
        this.setState({ filter: { age: true, location: false, popularity: false, tag: false } });
      } else {
        this.setState({ filter: { age: false, location: false, popularity: false, tag: false } });
      }
    } else if (event === "location") {
      if (!this.state.filter.location) {
        this.setState({
          pretender: this.state.pretender.sort((a, b) => {
            if (a.country.toLowerCase() < b.country.toLowerCase()) {
              return -1;
            }
            if (a.country.toLowerCase() > b.country.toLowerCase()) {
              return 1;
            }
            return 0;
          }),
        });
        this.setState({ filter: { age: false, location: true, popularity: false, tag: false } });
      } else {
        this.setState({ filter: { age: false, location: false, popularity: false, tag: false } });
      }
    } else if (event === "popularity") {
      if (!this.state.filter.popularity) {
        this.setState({
          pretender: this.state.pretender.sort((b, a) => {
            return a.popularity - b.popularity;
          }),
        });
        this.setState({ filter: { age: false, location: false, popularity: true, tag: false } });
      } else {
        this.setState({ filter: { age: false, location: false, popularity: false, tag: false } });
      }
    } else if (event === "tag") {
      if (!this.state.filter.tag) {
        this.setState({
          pretender: this.state.pretender.sort((b, a) => {
            return a.tag.length - b.tag.length;
          }),
        });
        this.setState({ filter: { age: false, location: false, popularity: false, tag: true } });
      } else {
        this.setState({ filter: { age: false, location: false, popularity: false, tag: false } });
      }
    }
  };

  render() {
    Moment.locale("fr");
    return (
      <div style={{ overflow: "auto" }}>
        <div className="filterContainer">
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
        <InfiniteScroll
          loadMore={this.loadMore.bind(this)}
          hasMore={this.state.hasMore}
          loader={
            <div key={0} className="loader">
              {" "}
              Loading...{" "}
            </div>
          }
          useWindow={true}
          threshold={250}
        >
          <div className="cardContainer fade">
            {this.state.pretender &&
              this.state.pretender.map((pretender, i) => (
                <Link key={i} to={"profile/?uid=" + pretender.uid}>
                  <Card className="item" key={i}>
                    <Card.Img
                      className="myPic"
                      variant="top"
                      src={
                        pretender.path
                          ? process.env.PUBLIC_URL + pretender.path
                          : "https://source.unsplash.com/collection/159213/sig=" + i
                      }
                    />
                    <div className="overlay">
                      <Card.Title className="title">
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
                      {this.state.likes.map((likes, i) => (
                        <Card.Text key={i}>
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
                      <div style={{ marginTop: "50px", display: "flex", flexWrap: "wrap" }}>
                        {pretender.tag[0] !== null &&
                          pretender.tag.map(
                            (tag, i) =>
                              i < 6 && (
                                <div key={i} style={{ marginRight: "5px", maxWidth: "80px", overflow: "hidden" }}>
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
    );
  }
}

export default Home;
