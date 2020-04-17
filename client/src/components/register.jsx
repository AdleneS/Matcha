import React, {useState} from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import {useHistory} from "react-router-dom";
import "./animation.css";

export default function Register () {

	const [sValue, setValue] = useState({login:'', email:'', password:'', verify_password:'', birthday:'', gender:'man', sexual_orientation:'heterosexual'});

	const handleInputChange = (event) => {
		const { value, name } = event.target;
		setValue({...sValue, [name]: value})
	}

	let history = useHistory();
	const onSubmit = (event) => {
		event.preventDefault();
		fetch('/auth/register', {
			method: 'POST',
			body: JSON.stringify(sValue),
			headers:{'Content-type': 'application/json'}
		})
		.then(res =>  res.json().then(data => ({status: res.status, body: data})))
		.then(res => {
			if (res.status === 200) {
				history.push('/login');
			} else {
				console.log(res.body.error)
				if (res.body.errortype === "login")
					document.getElementById("login").classList.add("shake");
				if (res.body.errortype === "email")
					document.getElementById("email").classList.add("shake");
				if (res.body.errortype === "info"){
					document.getElementById("verify_password").classList.add("shake");
					document.getElementById("password").classList.add("shake");
				}
					
				const error = new Error(res.body.error);
				throw error;
			}
		})
			.catch(err => {
		});
	}

	const divReg = {
		width: "600px",
		height: "460px",
		backgroundColor: "#1a1a1a",
		padding: "9px",
		color: "white",
		borderBottom: "15px solid #111111",
		margin:"Auto",
		marginTop:"30px",
	};

	return (
		<div style={divReg} className="fade">
			<Form onSubmit={(event) => {onSubmit(event)}}>
			<Form.Row>
				<Form.Group as={Col} controlId="login">
					<Form.Label >Login</Form.Label>
					<Form.Control type="text"placeholder="Enter login" name="login" onChange={(event) => {handleInputChange(event)}} value={sValue.login} />
				</Form.Group>
				<Form.Group as={Col} controlId="email">
					<Form.Label>Email</Form.Label>
					<Form.Control type="email" placeholder="Enter email" name="email" onChange={(event) => {handleInputChange(event)}} value={sValue.email} />
				</Form.Group>
				</Form.Row>
				<Form.Group controlId="birthday">
					<Form.Label>Birthday</Form.Label>
					<Form.Control type="date" placeholder="Enter email" name="birthday" onChange={(event) => {handleInputChange(event)}} value={sValue.birthday}/>
				</Form.Group>
				<Form.Row>
					<Form.Group as={Col} controlId="password">
						<Form.Label>Password</Form.Label>
						<Form.Control type="password" placeholder="Enter email" name="password" onChange={(event) => {handleInputChange(event)}} value={sValue.password}/>
					</Form.Group>

					<Form.Group as={Col} controlId="verify_password">
						<Form.Label>Confirm Password</Form.Label>
						<Form.Control type="password" placeholder="Password" name="verify_password" onChange={(event) => {handleInputChange(event)}} value={sValue.verify_password}/>
					</Form.Group>
				</Form.Row>

				<Form.Row>
					<Form.Group as={Col} controlId="gender">
						<Form.Label>Gender</Form.Label>
							<Form.Control as="select" custom name="gender" onChange={(event) => {handleInputChange(event)}} value={sValue.gender}>
								<option>Man</option>
								<option>Woman</option>
								<option>Other</option>
							</Form.Control>
					</Form.Group>

					<Form.Group as={Col} controlId="sexual_orientation">
						<Form.Label>Sexual Orientation</Form.Label>
							<Form.Control as="select" custom name="sexual_orientation" onChange={(event) => {handleInputChange(event)}} value={sValue.sexual_orientation}>
								<option>Heterosexual</option>
								<option>Homosexual</option>
								<option>Bisexual</option>
							</Form.Control>
					</Form.Group>
				</Form.Row>

				<Form.Group id="formGridCheckbox">
					<Form.Check type="checkbox" label="Check me out" />
				</Form.Group>
				<Button variant="primary" type="submit">
					Submit
				</Button>
			</Form>
		</div>
	)
}