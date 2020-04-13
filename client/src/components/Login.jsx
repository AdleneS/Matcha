import React, {useState, useContext} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import MyContext from './appcontext';
import {useHistory} from "react-router-dom";

export default function Login () {

	const [sValue, setValue] = useState({email:'', password:''});
	const { setIsLogged } = useContext(MyContext);
	const setIsLoggedTrue = () => {
		setIsLogged(true);
	}
	
	//constructor(props) {
	//  super(props)
	//  this.state = {
	//	email : '',
	//	password: ''
	//  };
	//}

	const handleInputChange = (event) => {
		const { value, name } = event.target;
		setValue({...sValue, [name]: value})
	}
	let history = useHistory();
	const onSubmit = (event) => {
		event.preventDefault();
		
		fetch('/auth/signup', {
			method: 'POST',
			body: JSON.stringify(sValue),
			headers:{
				'Content-type': 'application/json'
			}
		})
		.then(res =>  res.json().then(data => ({status: res.status, body: data})))
		.then(res => {
			console.log("Responses:", res);
			if (res.status === 200) {
				setIsLoggedTrue();
				history.push('/home');
			} else {
				const error = new Error(res.body.error);
				throw error;
			}
		})
			.catch(err => {
			alert(err);
		});
	}

	const divLog = {
		width: "400px",
		height: "320px",
		backgroundColor: "#1a1a1a",
		padding: "9px",
		color: "white",
		borderBottom: "15px solid #111111",
		margin:"Auto",
		marginTop:"30px",
	};

	return (
		<div style={divLog}>
			<Form onSubmit={(event) => {onSubmit(event)}}>
				<Form.Group controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control type="email" name="email" placeholder="Enter email"onChange={(event) => {handleInputChange(event)}} value={sValue.email}  required/>
					<Form.Text className="text-muted">
						We'll never share your email with anyone else.
					</Form.Text>
				</Form.Group>
				<Form.Group controlId="formBasicPassword">
					<Form.Label>Password</Form.Label>
					<Form.Control type="password" name="password" value={sValue.password} onChange={(event) => {handleInputChange(event)}} placeholder="Password" required/>
				</Form.Group>
				<Form.Group controlId="formBasicCheckbox">
					<Form.Check type="checkbox" label="Check me out" required />
				</Form.Group>
				<Button variant="primary" type="submit">
					Submit
				</Button>
			</Form>
		</div>
	);
}