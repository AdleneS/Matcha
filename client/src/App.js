import React, { useState, useEffect } from 'react';
import './App.css';
import Customers from './components/customers';
import NavBar from './components/navBar';
import Login from './components/Login';
import Home from './components/home';
import Register from './components/register';
import ErrorPage from './components/404';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import withAuth from './withAuth';
import MyContext from './components/appcontext';

import testupload from './components/test_upload'
import io from 'socket.io-client'
const ENDPOINT = "127.0.0.1:5000"
const socket = io(ENDPOINT);

export default function App() {
	const [islogged, setIsLogged] = useState(false);

	useEffect(() => {
		fetch('/checkCookie')
		.then(res =>  res.json().then(data => ({status: res.status, body: data})))
		.then(res => {
			if (res.status === 200){
				setIsLogged(true);
				socket.emit('FromAPI', res.body.uid)
			} else {
				const error = new Error(res.error);
				throw error;
			}
		})
		.catch(err => {
			setIsLogged(false);
		});
	});

	return (
		<MyContext.Provider value={{islogged: islogged, setIsLogged:setIsLogged}}>
			<div className="app">
					<BrowserRouter>
						<NavBar socket={socket}/>
						<Switch>
							<Route exact path="/">
								<Redirect to="/home"/>
							</Route>
							<Route path="/home" component={withAuth(Home, socket)}/>
							<Route path="/testupload" component={withAuth(testupload)} />
							<Route path="/customers" component={withAuth(Customers)} />
							<Route path="/login">
								<Login socket={socket}/>
							</Route>
							<Route path="/register" component={Register} />
							<Route path='*' component={ErrorPage}/>
						</Switch>
					</BrowserRouter>
			</div>
		</MyContext.Provider>
	 );
}