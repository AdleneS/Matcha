import React, { Component } from 'react';
import Moment from 'moment';
import "./animation.css";
import Media from 'react-bootstrap/Media'
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
						return <Media key={matches.id} style={{color:"white"}}>
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
			</div>
		);
	}
}

export default Chat;