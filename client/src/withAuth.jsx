import React, { useState, useContext, useEffect } from "react";
import Spinner from "react-bootstrap/Spinner";
import { Redirect, Route } from "react-router-dom";
import MyContext from "./components/appcontext";

const WithAuth = ({ component: Component, socket, ...rest }) => {
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState(false);
  const [alert, setAlert] = useState(false);
  const [uid, setUid] = useState(null);
  const { islogged, setIsLogged } = useContext(MyContext);

  useEffect(() => {
    fetch("/checkCookie")
      .then((res) => res.json().then((data) => ({ status: res.status, body: data })))
      .then((res) => {
        if (res.status === 200) {
          setIsLogged(true);
          navigator.geolocation.getCurrentPosition(
            function (position) {
              fetch(
                "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
                  position.coords.latitude +
                  "," +
                  position.coords.longitude +
                  "&sensor=true&key=AIzaSyBB5VTQyz6e47nmfW6VxZjj4_hb3ONitrI"
              )
                .then((res) => res.json())
                .then((geo) => {
                  fetch("/users/location", {
                    method: "POST",
                    body: JSON.stringify({
                      location: geo.results[5].address_components[1].long_name,
                    }),
                    headers: {
                      "Content-type": "application/json",
                    },
                  });
                });
            },
            function () {
              fetch("https://ipapi.co/json?token=b938095cfb7a67")
                .then(function (response) {
                  return response.json();
                })
                .then(function (geo) {
                  fetch("/users/location", {
                    method: "POST",
                    body: JSON.stringify({ location: geo.city }),
                    headers: {
                      "Content-type": "application/json",
                    },
                  });
                });
            }
          );
          setUid(res.body.uid);
          setLoading(false);
        } else {
          setRedirect(true);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        setRedirect(true);
        throw err;
      });
  }, [setIsLogged]);

  const spin = {
    margin: "0 auto",
    width: "100px",
    height: "100px",
  };

  if (alert) {
    return <Redirect to={{ pathname: "/changeinfo", state: { alert: true } }} />;
  }
  if (loading) {
    return (
      <div style={{ display: "flex", marginTop: "100px" }}>
        <Spinner style={spin} animation="border" variant="dark" />
      </div>
    );
  }
  if (redirect) {
    setIsLogged(false);
    return <Redirect to="/login" />;
  } else if (!loading && !redirect) {
    socket.emit("FromAPI", uid);
    return <Route {...rest} render={(props) => <Component {...props} socket={socket} />} />;
  }

  if (Component?.name !== "Test_upload" && islogged) {
    fetch("/checkpic").then((res) => {
      if (res.status !== 200) {
        setAlert(true);
      }
    });
  }
};

export default WithAuth;
