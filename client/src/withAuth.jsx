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
      };
    }

    componentDidMount() {
      this._isMounted = true;
      fetch("/checkCookie")
        .then((res) => {
          if (res.status === 200) {
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

    componentWillUnmount() {
      this._isMounted = false;
    }
    render() {
      const { setIsLogged } = this.context;
      const spin = {
        margin: "0 auto",
        width: "100px",
        height: "100px",
      };

      const { loading, redirect } = this.state;
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
      if (this._isMounted && !loading && !redirect) return <ComponentToProtect {...this.props} socket={socket} />;
    }
  };
}
