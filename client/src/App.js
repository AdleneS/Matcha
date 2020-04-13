import React, { useState, useEffect } from 'react';
import './App.css';
import Customers from './components/customers';
import NavBar from './components/navBar';
import Login from './components/Login';
import Home from './components/home';
import Register from './components/register';
import ErrorPage from './components/404';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import withAuth from './withAuth';
import MyContext from './components/appcontext';

export default function App() {
	const [islogged, setIsLogged] = useState(false);

	useEffect(() => {
		fetch('/checkCookie')
		.then(res => {
			if (res.status === 200){
				setIsLogged(true);
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
					<NavBar />
					<Switch>
						<Route path="/home" component={withAuth(Home)} />
						<Route path="/customers" component={withAuth(Customers)} />
						<Route path="/login" component={Login} />
						<Route path="/register" component={Register} />
						<Route path='*' component={ErrorPage}/>
					</Switch>	</BrowserRouter>
			</div>
	
		</MyContext.Provider>
	 );
}