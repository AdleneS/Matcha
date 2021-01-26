import React, { useState } from "react";
import "./App.css";
import NavBar from "./components/navBar";
import Login from "./components/Login";
import Home from "./components/home";
import Chat from "./components/chat";
import Register from "./components/register";
import ErrorPage from "./components/404";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import MyContext from "./components/appcontext";
import ChangeInfo from "./components/change_info";
import Profile from "./components/profile";
import Search from "./components/search";

import io from "socket.io-client";
import WithAuth from "./withAuth";
const ENDPOINT = "127.0.0.1:5000";
const socket = io(ENDPOINT);

export default function App() {
  const [islogged, setIsLogged] = useState(false);

  return (
    <MyContext.Provider value={{ islogged: islogged, setIsLogged: setIsLogged }}>
      <div className="app">
        <BrowserRouter>
          <NavBar socket={socket}></NavBar>
          <Switch>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
            <WithAuth path="/home" component={Home} socket={socket} />
            <WithAuth exact path="/profile" component={Profile} socket={socket} />
            <WithAuth exact path="/profile/user/" component={Profile} socket={socket} />
            <WithAuth path="/changeinfo" component={ChangeInfo} socket={socket} />
            <WithAuth path="/chat/:match_uid" component={Chat} socket={socket} />
            <WithAuth path="/search/" component={Search} socket={socket} />
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
