import React, { Component } from "react";
import Spinner from "react-bootstrap/Spinner";
import { Redirect } from "react-router-dom";
import MyContext from "./components/appcontext";

export default function withAuth(ComponentToProtect, socket) {
  return class extends Component {
    static contextType = MyContext;

    _isMounted = false;
    constructor(props) {
      super(props);
      this.state = {
        loading: true,
        redirect: false,
        alert: false,
      };
    }

    componentDidMount() {
      console.log(this.contextType);
      this._isMounted = true;
      if (ComponentToProtect.name !== "Test_upload") {
        fetch("/checkpic").then((res) => {
          if (res.status !== 200) {
            this.setState({ alert: true });
          }
        });
      }
      fetch("/checkCookie")
        .then((res) => {
          if (res.status === 200) {
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
            //socket.emit("FromAPI", res.body[0].uid);
            this.setState({ loading: false });
          } else {
            const error = new Error(res.error);
            throw error;
          }
        })
        .catch((err) => {
          this.setState({ loading: false, redirect: true });
        });
    }

    setGeo(geo) {
      if (geo) {
        fetch("/users/location", {
          method: "POST",
          body: JSON.stringify({ location: geo }),
          headers: {
            "Content-type": "application/json",
          },
        });
      }
    }

    componentWillUnmount() {
      console.log("ppppp");
      this._isMounted = false;
    }

    render() {
      const { setIsLogged } = this.context;
      const spin = {
        margin: "0 auto",
        width: "100px",
        height: "100px",
      };
      const { loading, redirect, alert } = this.state;
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
      }
      if (this._isMounted && !loading && !redirect) {
        return <ComponentToProtect {...this.props} socket={socket} />;
      }
    }
  };
}
