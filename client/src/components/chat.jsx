import React, { Component } from "react";
import Moment from "moment";
import "./animation.css";
import Media from "react-bootstrap/Media";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Image from "react-bootstrap/Image";
import { Link } from "react-router-dom";

import "./chat.scss";
import "./animation.css";

class Chat extends Component {
  messagesEnd = null;
  constructor(props) {
    super(props);
    this.state = {
      matches: [],
      cookie: {},
      messages: [],
      msg: "",
      currentRoom: "",
      loading: true,
    };
  }

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

  scrollToBottom = () => {
    if (this.messagesEnd) this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  };

  componentDidUpdate() {
    this.scrollToBottom();
  }

  componentDidMount() {
    fetch("/cookie/")
      .then((res) => res.json())
      .then((cookie) => this.setState({ cookie }));
    fetch("/match/get")
      .then((res) => res.json())
      .then(async (matches) => {
        return this.setState({ matches }, () => {
          this.setState({ loading: false });
          if (this.state.matches.length) {
            this.state.matches.sort((a, b) => this.sortByTitleConsistentASC(b, a));
            this.setState({ currentRoom: this.state.matches[0].uid });
            this.props.history.push("/chat/" + this.state.matches[0].uid);
            fetch("/chat/get/" + this.state.matches[0].uid)
              .then((res) => res.json())
              .then((messages) => this.setState({ messages }));
            this.scrollToBottom();
          }
        });
      });
  }

  sortByTitleConsistentASC(itemA, itemB) {
    var a = itemA.connected;
    var b = itemB.connected;
    var r = a > b ? 1 : a < b ? -1 : 0;
    if (r === 0) {
      r = typeof itemA.id !== "undefined" && typeof itemB.id !== "undefined" ? itemA.id - itemB.id : 0;
    }
    return r;
  }

  getMessage(match_uid) {
    fetch("/chat/get/" + match_uid)
      .then((res) => res.json())
      .then((messages) => this.setState({ messages }));
    this.scrollToBottom();
  }

  onClickMatch = (event, match_uid) => {
    event.preventDefault();
    fetch("/chat/get/" + match_uid)
      .then((res) => res.json())
      .then((messages) => this.setState({ messages }));
    this.props.history.push("/chat/" + match_uid);
    this.setState({ currentRoom: match_uid });
  };

  handleInputChange = (event) => {
    this.setState({ msg: event.target.value });
  };

  socketGetMessage = this.props.socket.on("getMessage", (match_uid) => {
    if (this.state.currentRoom === match_uid) this.getMessage(match_uid);
  });

  onSubmit = (event) => {
    event.preventDefault();
    const match_uid = this.state.currentRoom;
    if (this.state.msg) {
      fetch("/chat/create/" + match_uid, {
        method: "POST",
        body: JSON.stringify({ match_uid: this.state.matches[0].uid, msg: this.state.msg }),
        headers: {
          "Content-type": "application/json",
        },
      })
        .then((res) => res.json().then((data) => ({ status: res.status, body: data })))
        .then((res) => {
          if (res.status === 200) {
            const data = {
              notified_uid: match_uid,
              notif_type: res.body.info,
            };
            this.getMessage(match_uid);
            this.props.socket.emit("sendMessage", match_uid);
            this.createNotif(data);
            this.setState({ msg: "" });
          }
        });
    }
  };

  render() {
    Moment.locale("fr");
    if (this.state.loading) {
      return null;
    }
    if (!this.state.matches.length) {
      return (
        <div className="noMatch">
          {" "}
          NO MATCH TRY TO MATCH SOMEONE HERE <Link to="/home"> HOME </Link>{" "}
        </div>
      );
    }
    return (
      <div className="containerDiv fade">
        <div className="containerMatch">
          {this.state.matches.map((match) => {
            return (
              <Media
                onClick={(event) => {
                  this.onClickMatch(event, match.uid);
                }}
                className={this.state.currentRoom === match.uid ? "selectedRoom" : null}
                key={match.id}
                style={{ color: "white", padding: "10px", cursor: "pointer", alignItems: "center" }}
              >
                <div className={`${match.connected ? "gradient " : " disconnected"}`}>
                  <Image
                    className={`myPicMini`}
                    src={process.env.PUBLIC_URL + match.path}
                    alt="Generic placeholder"
                    roundedCircle
                  />
                </div>
                <Media.Body style={{ marginLeft: "10px" }}>
                  <h5>{match.login}</h5>
                </Media.Body>
              </Media>
            );
          })}
        </div>
        <div className="containerChat fade">
          {this.state.messages.map((message) => {
            return (
              <div
                ref={(el) => {
                  this.messagesEnd = el;
                }}
                key={message.id}
                className={message.uid_sender === this.state.cookie.info.uid ? "userMsg" : "matchMsg"}
              >
                {message.msg}
                <div className="dateMsg">{Moment(message.date).format("MMMM Do YYYY, h:mm a")}</div>
              </div>
            );
          })}
        </div>
        <div className="containerInput">
          <Form
            onSubmit={(event) => {
              this.onSubmit(event);
            }}
          >
            <InputGroup className="mb-3">
              <FormControl
                onChange={(event) => {
                  this.handleInputChange(event);
                }}
                value={this.state.msg}
                placeholder="Message"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
              />
              <InputGroup.Append>
                <Button variant="dark" type="submit">
                  Send
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </Form>
        </div>
      </div>
    );
  }
}

export default Chat;
