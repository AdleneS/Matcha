import React, { useContext, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from '../imgs/logoMatcha.png';
import MyContext from './appcontext';
import {Link} from 'react-router-dom';
import { useEffect } from 'react';
import socketIOClient from "socket.io-client"
import { FaBell } from "react-icons/fa";

const ENDPOINT = "127.0.0.1:5000"

export default function Mynav () {
	const {islogged, setIsLogged} = useContext(MyContext);
	const [response, setResponse] = useState("");
	
	useEffect(() => {
		const socket = socketIOClient(ENDPOINT);
		socket.on("FromAPI", data => {
			setResponse(data);
		});
	}, []);

	function handleClick(e) {
		e.preventDefault();
		fetch('/logout')
		.then(res => {
			if (res.status === 200){
				setIsLogged(false);
			} else {
				const error = new Error(res.error);
				throw error;
			}
		})
		//document.cookie = 'ssid =; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}
	
	return (
		<Navbar className="nav-flat" variant="dark">
			<Link to={"/home"}>
				<Navbar.Brand>
					<img
						src={logo}
						width="150"
						height="50"
						className="d-inline-block align-top"
						alt="React Bootstrap logo"
					/>
				</Navbar.Brand>
			</Link>

			<Nav className="mr-auto">
				<Link className="nav-link" to={"/home"}> Home </Link>
				{!islogged && <Link className="nav-link" to={"/login"}> Login </Link>}
				<Link className="nav-link" to={"/customers"}> Customers </Link>
				{!islogged && (<Link className="nav-link" to={"/register"}> Sign In </Link>)}
				{islogged && (<Link className="nav-link" to={"/testupload"}> Profil </Link>)}
				{islogged && (<Navbar.Text className="nav-link" onClick={handleClick}> Log Out </Navbar.Text>)}
			</Nav>
			<FaBell style={{color: "#FFFFFF", width: "30px", height: "30px",}}/>
			<FaBell style={{color: "#AA11ff", width: "30px", height: "30px",}}/>
			<p style={{color: 'white'}}> <time dateTime={response}> {response} </time></p>
		</Navbar>
	);
}

