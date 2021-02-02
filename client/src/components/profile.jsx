import React, { Component } from "react";
import "./profile.scss";
import Image from "react-bootstrap/Image";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { MdBlock, MdReport } from "react-icons/md";

class profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: [],
      likes: [],
      likes_you: [],
      gallery: [],
      cookie: {},
      is_like: 0,
      is_likes_you: 0,
      redirect: false,
    };
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    const queryString = window.location.search;
    const urlParam = new URLSearchParams(queryString);
    if (urlParam.get("uid") === "") {
      this.setState({ redirect: true });
    } else {
      fetch("/cookie/")
        .then((res) => res.json())
        .then((cookie) => {
          this.setState({ cookie }, () => {
            const data = {
              notified_uid: urlParam.get("uid"),
              notif_type: "view",
            };
            if (cookie.info.uid !== urlParam.get("uid")) {
              this.createNotif(data);
            }
          });
        });
      fetch("/profile/" + urlParam.get("uid"))
        .then((response) => response.json())
        .then((user) => {
          if (!user.length) {
            this.setState({ redirect: true });
          } else {
            this.setState({ user });
          }
        });
      fetch("/profile/like/" + urlParam.get("uid"))
        .then((res) => res.json())
        .then((likes) => this.setState({ likes }))
        .then((likes) => {
          if (this.state.likes[0] && this.state.user[0]) {
            if (this.state.likes[0].uid_liked === this.state.user[0].uid) {
              this.setState({ is_like: 1 });
            } else this.setState({ is_like: 0 });
          } else {
            this.setState({ is_like: 0 });
          }
        });
      fetch("/profile/likeYou/" + urlParam.get("uid"))
        .then((response) => response.json())
        .then((likes_you) => this.setState({ likes_you }))
        .then((likes_you) => {
          if (this.state.likes_you[0]) {
            this.setState({ is_likes_you: 1 });
          } else {
            this.setState({ is_likes_you: 0 });
          }
        });
      fetch("/profile/gallery/" + urlParam.get("uid"))
        .then((res) => res.json())
        .then((gallery) => this.setState({ gallery }));
    }
  }

  onClickReport = () => {
    fetch("/profile/report/", {
      method: "POST",
      body: JSON.stringify({ uidUser: this.state.user[0].uid }),
      headers: {
        "Content-type": "application/json",
      },
    });
  };

  createNotif = (data) => {
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
    this.props.socket.emit("sendNotif", data.notified_uid);
  };

  onClick = (event, pretenderUid) => {
    const queryString = window.location.search;
    const urlParam = new URLSearchParams(queryString);
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
          fetch("/profile/like/" + urlParam.get("uid"))
            .then((res) => res.json())
            .then((likes) => this.setState({ likes }));
          if (this.state.likes[0]) {
            if (this.state.likes[0].uid_liked === this.state.user[0].uid) this.setState({ is_like: 0 });
            else this.setState({ is_like: 1 });
          } else {
            this.setState({ is_like: 1 });
          }
        } else {
          const error = new Error(res.body.error);
          throw error;
        }
      })
      .catch((err) => {
        alert(err);
      });
  };

  onClickBlock = () => {
    fetch("/profile/block/", {
      method: "POST",
      body: JSON.stringify({ uidUser: this.state.user[0].uid }),
      headers: {
        "Content-type": "application/json",
      },
    }).then((res) => {
      res.json().then((res) => {
        if (res.info === "block") {
          alert("You blocked this user");
        } else {
          alert("You unblocked this user");
        }
      });
    });
  };

  render() {
    if (this.state.redirect) {
      return (
        <div style={{ marginTop: "100px", marginLeft: "10px", color: "white" }}>Their is no user with this uid</div>
      );
    }
    return (
      <div>
        <Container>
          {this.state.user.map((user) => (
            <div key={user.id}>
              <div className="test containerDivProfile"></div>
              <Row className="test block">
                <Col md={3}>
                  <Image
                    className="img_size"
                    src={
                      user.path
                        ? process.env.PUBLIC_URL + user.path
                        : "https://source.unsplash.com/collection/159213/sig=" + Math.random()
                    }
                    roundedCircle
                  />
                </Col>
                <Col>
                  <Row>
                    <h1 className="test">{user.login}</h1>
                  </Row>
                  <Row>
                    <p>{user.gender}</p>
                  </Row>
                  <Row>
                    <p>{user.sexual_orientation}</p>
                  </Row>
                </Col>
              </Row>
              <Row className="test">
                <Col className="test block">
                  {this.state.is_like === 1 ? (
                    <BsHeartFill
                      onClick={(event) => {
                        this.onClick(event, user.uid);
                      }}
                      style={{
                        marginTop: "10px",
                        color: "#ff3333",
                        width: "30px",
                        height: "30px",
                        position: "absolute",
                      }}
                    />
                  ) : null}
                  <BsHeart
                    onClick={(event) => {
                      this.onClick(event, user.uid);
                    }}
                    style={{
                      marginTop: "10px",
                      color: "#ff3333",
                      width: "30px",
                      height: "30px",
                      position: "absolute",
                    }}
                  />
                  <div style={{ marginLeft: "40px", marginTop: "10px" }}>
                    {this.state.is_likes_you === 1 ? <p>{user.login} vous a like</p> : null}
                  </div>
                </Col>
                <Col className="test block">
                  <div style={{ marginTop: "10px" }}>{<p>565632</p>}</div>
                </Col>
                <Col className="test block">
                  <MdReport
                    onClick={() => {
                      this.onClickReport();
                    }}
                    style={{
                      color: "#ff3333",
                      width: "30px",
                      height: "30px",
                      position: "absolute",
                      marginTop: "10px",
                    }}
                  />
                  <MdBlock
                    onClick={() => {
                      this.onClickBlock();
                    }}
                    style={{
                      color: "#ff3333",
                      width: "30px",
                      height: "30px",
                      position: "absolute",
                      marginLeft: "40px",
                      marginTop: "10px",
                    }}
                  />
                </Col>
              </Row>

              <Row className="test block" style={{ height: "140px" }}>
                <p>{user.description}</p>
              </Row>
            </div>
          ))}
          <div id="galery" className="gallery">
            {this.state.gallery.map((gallery, i) => (
              <div className="lightbox" id={"lightbox" + i} key={i}>
                <img src={process.env.PUBLIC_URL + gallery.path} alt="First slide" />
              </div>
            ))}
          </div>
        </Container>
      </div>
    );
  }
}

export default profile;
