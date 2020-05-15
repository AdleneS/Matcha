import React, { useContext, useState, useEffect } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from '../imgs/logoMatcha.png';
import MyContext from './appcontext';

import {Link} from 'react-router-dom';
import { FaBell } from "react-icons/fa";


export default function Mynav (props) {
	const {islogged, setIsLogged} = useContext(MyContext);
	const [nb_notif, set_nbNotif] = useState(0);
	const [notifs, setNotif] = useState([])
	const socket = props.socket;

	useEffect(() => {
		socket.on('getNotif', () => {
			set_nbNotif(nb_notif => nb_notif + 1)
		});
	},[socket])
	
	useEffect(() => {
		fetch('/notif/get')
		.then(response => response.json())
		.then(response => setNotif(response));
	}, [])

	useEffect(() => {
		fetch('/notif/get')
			.then(response => response.json())
			.then(response => setNotif(response));
	}, [nb_notif])

	useEffect(() => {
		console.log(notifs)
	}, [notifs])

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
				{islogged && (<Navbar.Text className="nav-link" style={{cursor: "pointer"}} onClick={handleClick}> Log Out </Navbar.Text>)}
			</Nav>
				{nb_notif > 0 && <FaBell  onClick={nb_notif => set_nbNotif(0)} style={{color: "red", width: "30px", height: "30px", cursor: "pointer"}}/>}
				{nb_notif < 1 && <FaBell style={{color: "#FFFFFF", width: "30px", height: "30px"}}/>}
		</Navbar>
	);
}

