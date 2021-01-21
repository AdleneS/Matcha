import React, { useState, useEffect } from "react";
import "./App.css";
import Customers from "./components/customers";
import NavBar from "./components/navBar";
import Login from "./components/Login";
import Home from "./components/home";
import Chat from "./components/chat";
import Register from "./components/register";
import ErrorPage from "./components/404";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import withAuth from "./withAuth";
import MyContext from "./components/appcontext";
import ChangeInfo from "./components/change_info";
import Profile from "./components/profile";
import Search from "./components/search";

import io from "socket.io-client";
const ENDPOINT = "127.0.0.1:5000";
const socket = io(ENDPOINT);

export default function App() {
  const [islogged, setIsLogged] = useState(false);

  useEffect(() => {
    fetch("/checkCookie")
      .then((res) => res.json().then((data) => ({ status: res.status, body: data })))
      .then((res) => {
        if (res.status === 200) {
          socket.emit("FromAPI", res.body[0].uid);
          setIsLogged(true);
        } else {
          setIsLogged(false);
          const error = new Error(res.body.error);
          throw error;
        }
      })
      .catch((err) => {
        setIsLogged(false);
      });
  }, []);

  return (
    <MyContext.Provider value={{ islogged: islogged, setIsLogged: setIsLogged }}>
      <div className="app">
        <BrowserRouter>
          <NavBar socket={socket}></NavBar>
          <Switch>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
            <Route path="/home" component={withAuth(Home, socket)} />
            <Route exact path="/profile" component={withAuth(Profile, socket)} />
            <Route exact path="/profile/user/" component={withAuth(Profile)} />
            <Route path="/changeinfo" component={withAuth(ChangeInfo)} />
            <Route path="/customers" component={withAuth(Customers)} />
            <Route exact path="/chat/:match_uid" component={withAuth(Chat, socket)} />
            <Route path="/search/" component={withAuth(Search, socket)} />
            <Route path="/login">
              <Login socket={socket}></Login>
            </Route>
            <Route path="/register" component={Register} />
            <Route path="*" component={ErrorPage} />
          </Switch>
        </BrowserRouter>
      </div>
    </MyContext.Provider>
  );
}

// {islogged &&
// 	<Route path="/home">
// 		<Home socket={socket}/>
// 	</Route>
// }
