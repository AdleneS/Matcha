import React, { Component } from 'react';
import Moment from 'moment';
import "./animation.css";
import Media from 'react-bootstrap/Media'
import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import {Link} from 'react-router-dom';

import './chat.css';
import "./animation.css";

class Chat extends Component {
	messagesEnd = null;
	constructor(props){
		super(props);
		this.state = {
			matches: [],
			cookie: {},
			messages: [],
			msg:'',
			msgUrl: '',
			loading: true,
		}
	}

	createNotif = (data) => {
			fetch('/notif/create', {
			method: 'POST',
			body: JSON.stringify({ notified_uid: data.notified_uid , notifier_uid: data.notifier_uid ,notifier_login: data.notifier_login, notif_type: data.notif_type}),
			headers:{
				'Content-type': 'application/json'
			}
		})
	}

	scrollToBottom = () => {
		if (this.messagesEnd)
			this.messagesEnd.scrollIntoView({ behavior: "smooth" });
	}
	
	componentDidUpdate() {
		this.scrollToBottom();
	}

	componentDidMount(){
		fetch('/cookie/')
			.then(res => res.json())
			.then (cookie => this.setState({cookie}))
		fetch('/match/get')
			.then(res => res.json())
			.then (matches => this.setState({matches}, () => {
					this.setState({loading: false})
					if (this.state.matches.length){
						this.props.history.push("/chat/" + this.state.matches[0].uid);
					fetch('/chat/get/' + this.state.matches[0].uid)
						.then (res => res.json())
						.then (messages => this.setState({messages}))
					this.scrollToBottom();
				}
			}))
	}

	getMessage(match_uid){
		fetch('/chat/get/' + match_uid)
		.then (res => res.json())
		.then (messages => this.setState({messages}, () => console.log(this.state.messages)))
		this.scrollToBottom();
	}

	onClickMatch = (event, match_uid) => {
		event.preventDefault();
		fetch('/chat/get/' + match_uid)
		.then(res => res.json())
		.then (messages => this.setState({messages}, () => console.log(this.state.messages)))
		this.props.history.push("/chat/" + match_uid);
	}

	handleInputChange = (event) => {
		this.setState({msg: event.target.value})
	}

	onSubmit = (event) => {
		event.preventDefault();
		const match_uid = this.props.match.params.match_uid;
		if (this.state.msg){
			fetch('/chat/create/' + match_uid, {
			method: 'POST',
			body: JSON.stringify({ match_uid: this.state.matches[0].uid ,msg: this.state.msg}),
			headers:{
				'Content-type': 'application/json'
			}
		},)
		.then(res =>  res.json().then(data => ({status: res.status, body: data})))
		.then(res => {
				if (res.status === 200){
					const data = {notifier_uid: this.state.cookie.info.uid, notified_uid: match_uid, notifier_login: this.state.cookie.info.login, notif_type: res.body.info}
					this.getMessage(match_uid)
					this.createNotif(data)
					this.setState({msg: ''})
					console.log("Submited");
				}
			})
		}
	}

	render() {
		Moment.locale('fr');
		if (this.state.loading){
			return (null)
		}
		if (!this.state.matches.length){
				return (<div className="noMatch"> NO MATCH TRY TO MATCH SOMEONE HERE <Link to="/home"> HOME </Link> </div>)
			}
		return (
			<div className="containerDiv fade">
				<div className="containerMatch">
					{this.state.matches.map(matches => {
					return	<Media onClick={(event) => {this.onClickMatch(event, matches.uid)}} key={matches.id} style={{color:"white", padding:"5px", cursor: "pointer"}}>
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
				{this.state.messages.map(message => {
					return	<div ref={(el) => { this.messagesEnd = el;}} key={message.id} className={message.uid_sender === this.state.cookie.info.uid ? "userMsg" : "matchMsg"}>{message.msg}</div>
					})}
				</div>
				<div className="containerInput">
					<Form onSubmit={(event) => {this.onSubmit(event)}}>
						<InputGroup className="mb-3">
							<FormControl
							onChange={(event) => {this.handleInputChange(event)}} value={this.state.msg}
							placeholder="Message"
							aria-label="Recipient's username"
							aria-describedby="basic-addon2"
							/>
							<InputGroup.Append>
								<Button variant="dark" type="submit">Send</Button>
							</InputGroup.Append>
						</InputGroup>
					</Form>
				</div>
			</div>
		);
	}
}

export default Chat;