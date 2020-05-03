import React, { useContext } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from '../imgs/logoMatcha.png';
import MyContext from './appcontext';
import {Link} from 'react-router-dom';

export default function Mynav () {
	const {islogged, setIsLogged} = useContext(MyContext);

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
				<Link className="nav-link" to={"/login"}> Login </Link>
				<Link className="nav-link" to={"/customers"}> Customers </Link>
				{!islogged && (<Link className="nav-link" to={"/register"}> Sign In </Link>)}
				{islogged && (<Navbar.Text className="nav-link" onClick={handleClick}> Log Out </Navbar.Text>)}
				{islogged && (<Link className="nav-link" to={"/testupload"}> Profil </Link>)}

			</Nav>
		</Navbar>
	);
}

