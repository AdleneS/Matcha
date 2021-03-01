import React, { useContext, useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import { Redirect, Route } from "react-router-dom";
import MyContext from "./components/appcontext";

const WithAuth = ({ component: Component, socket, ...rest }) => {
  const [loading, setLoading] = useState(null);
  const [redirect, setRedirect] = useState(null);
  const [alert, setAlert] = useState(null);
  const [uid, setUid] = useState(null);
  const { islogged, setIsLogged } = useContext(MyContext);

  useEffect(() => {
    let isMounted = false;
    const runAsync = async () => {
      try {
        fetch("/checkCookie")
          .then((res) =>
            res.json().then((data) => ({ status: res.status, body: data }))
          )
          .then((res) => {
            if (res.status === 200 && !isMounted) {
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
                          location:
                            geo.results[5].address_components[1].long_name,
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
              fetch("/checkpic/").then((res) => {
                if (!isMounted) {
                  if (res.status !== 200 && Component?.name !== "ChangeInfo") {
                    setAlert(true);
                  } else {
                    setAlert(false);
                  }
                }
              });
              if (!isMounted) {
                setUid(res.body.uid);
                setLoading(false);
                setRedirect(false);
              }
            } else if (!isMounted) {
              setLoading(false);
              setRedirect(true);
            }
          });
      } catch (e) {
        if (!isMounted) {
          throw e;
        }
      }
    };
    runAsync();
    return () => {
      isMounted = true;
    };
  }, [setLoading, setRedirect, setAlert, setIsLogged, Component]);

  const spin = {
    margin: "0 auto",
    width: "100px",
    height: "100px",
  };

  if (alert !== null && loading !== null && redirect !== null) {
    if (loading) {
      return (
        <div style={{ display: "flex", marginTop: "100px" }}>
          <Spinner style={spin} animation="border" variant="dark" />
        </div>
      );
    } else if (redirect) {
      setIsLogged(false);
    } else if (alert && islogged) {
      return <Redirect to={{ pathname: "/changeinfo", state: { alert } }} />;
    } else if (!loading && !redirect && !alert) {
      socket.emit("FromAPI", uid);
      return (
        <Route
          {...rest}
          render={(props) => <Component {...props} socket={socket} />}
        />
      );
    }
  }
  return <div></div>;
};

export default WithAuth;
