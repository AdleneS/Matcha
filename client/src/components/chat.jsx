import React, { Component } from 'react';
import Moment from 'moment';
import "./animation.css";
import Media from 'react-bootstrap/Media'
import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

import './chat.css';
import "./animation.css";

class Chat extends Component {
	constructor(props){
		super(props);
		this.state = {
			matches: [],
			cookie: {}
		}
	}

	componentDidMount(){
		fetch('/cookie/')
			.then(res => res.json())
			.then (cookie => this.setState({cookie}))
		fetch('/match/get')
			.then(res => res.json())
			.then (matches => this.setState({matches}))
	}
	
	render() {
		Moment.locale('fr');

		return (
			<div className="containerDiv fade">
				<div className="containerMatch">
					{this.state.matches.map(matches => {
						return <Media key={matches.id} style={{color:"white", padding:"5px"}}>
							<img
								width={64}
								height={64}
								className="mr-3"
								src={process.env.PUBLIC_URL + matches.path}
								alt="Generic placeholder"
							/>
							
							<Media.Body>
								<h5>{matches.login}</h5>
							</Media.Body>
						</Media>	
					})}
				</div>
				<div className="containerChat">
					<div className="containerInput">
						<InputGroup className="mb-3">
							<FormControl
							placeholder="Message"
							aria-label="Recipient's username"
							aria-describedby="basic-addon2"
							/>
							<InputGroup.Append>
							<Button variant="primary">Button</Button>
							</InputGroup.Append>
						</InputGroup>					
					</div>
				</div>
			</div>
		);
	}
}

export default Chat;