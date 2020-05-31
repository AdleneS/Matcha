import React, { useContext, useState, useEffect } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from '../imgs/logoMatcha.png';
import MyContext from './appcontext';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import {Link} from 'react-router-dom';

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
	if (islogged){
		fetch('/notif/getnb')
			.then(response => response.json())
			.then(response => set_nbNotif(response));
		fetch('/notif/get')
			.then(response => response.json())
			.then(response => setNotif(response));
		}
	},[islogged])

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

	function onHover(e, notif_id) {
		e.preventDefault()
		fetch('/notif/setseen', {
			method: 'PUT',
			body: JSON.stringify({notif_id: notif_id}),
			headers:{
				'Content-type': 'application/json'
			}
		})
	}
	
	const navBarStyle = {
		
		width: "100%",
		zIndex: 1,
		margin: "auto",
		borderBottom: "1px solid rgb(13, 13, 14)",
		color: "white"
	};

	return (
		<Navbar className="nav-flat fixed-top" style={navBarStyle} variant="dark">
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
				{!islogged && (<Link className="nav-link" to={"/register"}> Sign In </Link>)}
				{islogged && (<Link className="nav-link" to={"/testupload"}> Profil </Link>)}
				{islogged && (<Link className="nav-link" to={"/chat/0"}> Chat </Link>)}
				{islogged && (<Navbar.Text className="nav-link" style={{cursor: "pointer"}} onClick={handleClick}> Log Out </Navbar.Text>)}
			</Nav>
			{islogged &&
			<DropdownButton onClick={nb_notif => set_nbNotif(0)} variant={nb_notif ? "danger" : "secondary"} id="dropdown-button-drop-left" drop='left' title={ nb_notif ? nb_notif + " Notifications" : 'Notification' }>
				{notifs.length ? notifs.map((notifs) => (
					<Dropdown.Item onMouseEnter={(event) => {onHover(event, notifs.id)}} key={notifs.id} href="#/action-1">{notifs.notifier_login} vous a {notifs.notif_type}</Dropdown.Item>
				)): 	<Dropdown.Item> Vous n'avez pas de notification <span role="img" aria-label="bad">☹️</span> </Dropdown.Item>}
			</DropdownButton>}
		</Navbar>
	);
}

