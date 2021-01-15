import React, { useContext, useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import logo from "../imgs/logoMatcha.png";
import MyContext from "./appcontext";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { Link } from "react-router-dom";
import { BsGearFill } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";

export default function Mynav(props) {
  const { islogged, setIsLogged } = useContext(MyContext);
  const [nb_notif, set_nbNotif] = useState(0);
  const [cookie, setCookie] = useState(null);
  const [notifs, setNotif] = useState([]);
  const socket = props.socket;

  useEffect(() => {
    socket.on("getNotif", () => {
      set_nbNotif((nb_notif) => nb_notif + 1);
      fetch("/notif/get")
        .then((response) => response.json())
        .then((response) => setNotif(response));
    });
  }, [socket]);

  useEffect(() => {
    if (islogged) {
      fetch("/cookie/")
        .then((response) => response.json())
        .then((cookie) => setCookie(cookie));
      fetch("/notif/getnb")
        .then((response) => response.json())
        .then((response) => set_nbNotif(response));
      fetch("/notif/get")
        .then((response) => response.json())
        .then((response) => setNotif(response));
    }
  }, [islogged]);

  //useEffect(() => {
  //	fetch('/notif/get')
  //		.then(response => response.json())
  //		.then(response => setNotif(response));
  //}, [nb_notif])

  function handleClick(e) {
    e.preventDefault();
    fetch("/logout").then((res) => {
      if (res.status === 200) {
        setIsLogged(false);
      } else {
        const error = new Error(res.error);
        throw error;
      }
    });
  }

  function onNotifClick(e) {
    e.preventDefault();
    set_nbNotif(0);
    fetch("/notif/setseen", {
      method: "POST",
      body: JSON.stringify(),
      headers: {
        "Content-type": "application/json",
      },
    });
  }

  const navBarStyle = {
    width: "100%",
    zIndex: 1,
    margin: "auto",
    borderBottom: "1px solid rgb(13, 13, 14)",
    color: "white",
  };

  return (
    <Navbar className="nav-flat fixed-top" style={navBarStyle} variant="dark">
      <Link to={"/home"}>
        <Navbar.Brand>
          <img src={logo} width="150" height="50" className="d-inline-block align-top" alt="React Bootstrap logo" />
        </Navbar.Brand>
      </Link>

      <Nav className="mr-auto">
        <Link className="nav-link" to={"/home"}>
          {" "}
          Home{" "}
        </Link>

        {!islogged && (
          <Link className="nav-link" to={"/login"}>
            {" "}
            Login{" "}
          </Link>
        )}
        {!islogged && (
          <Link className="nav-link" to={"/register"}>
            {" "}
            Sign In{" "}
          </Link>
        )}
        {islogged && cookie && (
          <Link className="nav-link" to={"/profile/user/?uid=" + cookie.info.uid}>
            {" "}
            Profil{" "}
          </Link>
        )}
        {islogged && (
          <Link className="nav-link" to={"/chat/0"}>
            {" "}
            Chat{" "}
          </Link>
        )}
        {islogged && (
          <Navbar.Text className="nav-link" style={{ cursor: "pointer" }} onClick={handleClick}>
            {" "}
            Log Out{" "}
          </Navbar.Text>
        )}
      </Nav>
      {islogged && (
        <Link to={"/search"}>
          <FaSearch
            style={{ cursor: "pointer", color: "#6c757d", width: "30px", height: "30px", marginRight: "10px" }}
          ></FaSearch>
        </Link>
      )}
      {islogged && (
        <Link to={"/changeinfo"}>
          <BsGearFill
            style={{ cursor: "pointer", color: "#6c757d", width: "30px", height: "30px", marginRight: "10px" }}
          ></BsGearFill>
        </Link>
      )}
      {islogged && (
        <DropdownButton
          onClick={(event) => {
            onNotifClick(event);
          }}
          variant={nb_notif ? "danger" : "secondary"}
          id="dropdown-button-drop-left"
          drop="left"
          title={nb_notif ? nb_notif + " Notifications" : "Notification"}
        >
          {notifs.length ? (
            notifs.map((notifs) =>
              notifs.notif_type === "message" ? (
                <Link className="dropdown-item" to={"/chat/" + notifs.notifier_uid} key={notifs.id}>
                  <span role="img" aria-label="speech">
                    💬
                  </span>{" "}
                  {notifs.notifier_login} sent you a {notifs.notif_type}{" "}
                </Link>
              ) : (
                <Link className="dropdown-item" to={"/profile/?uid=" + notifs.notifier_uid} key={notifs.id}>
                  <span role="img" aria-label="heart">
                    ❤️
                  </span>{" "}
                  {notifs.notifier_login} {notifs.notif_type}ed you{" "}
                </Link>
              )
            )
          ) : (
            <Dropdown.Item>
              {" "}
              Vous n'avez pas de notification{" "}
              <span role="img" aria-label="bad">
                ☹️
              </span>{" "}
            </Dropdown.Item>
          )}
        </DropdownButton>
      )}
    </Navbar>
  );
}
