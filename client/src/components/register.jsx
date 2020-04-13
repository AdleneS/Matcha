import React, {} from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';

export default function Register () {

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
		<div style={divReg}>
			<Form>
				<Form.Group controlId="email">
					<Form.Label>Email</Form.Label>
					<Form.Control type="email" placeholder="Enter email" />
				</Form.Group>
				<Form.Group controlId="birthday">
					<Form.Label>Birthday</Form.Label>
					<Form.Control type="date" placeholder="Enter email" />
				</Form.Group>
				<Form.Row>
					<Form.Group as={Col} controlId="password">
						<Form.Label>Password</Form.Label>
						<Form.Control type="password" placeholder="Enter email" />
					</Form.Group>

					<Form.Group as={Col} controlId="checkpassword">
						<Form.Label>Confirm Password</Form.Label>
						<Form.Control type="password" placeholder="Password" />
					</Form.Group>
				</Form.Row>

				<Form.Row>
					<Form.Group as={Col} controlId="sexe">
						<Form.Label>Gender</Form.Label>
							<Form.Control as="select" custom>
								<option>Man</option>
								<option>Woman</option>
								<option>Other</option>
							</Form.Control>
					</Form.Group>

					<Form.Group as={Col} controlId="">
						<Form.Label>Sexual Orientation</Form.Label>
							<Form.Control as="select" custom>
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