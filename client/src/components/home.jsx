import React, { Component } from 'react';
import Moment from 'moment';
import Card from 'react-bootstrap/Card';
import {Link} from 'react-router-dom';
import './home.css';
import "./animation.css";
import { BsHeart, BsHeartFill } from "react-icons/bs";

class Home extends Component {
	constructor(props){
		super(props);
		this.state = {
			pretender: [],
			likes: [],
			cookie: {}
		}
		this.onClick = this.onClick.bind(this);
	}

	componentDidMount(){
		fetch('/cookie/')
			.then(res => res.json())
			.then (cookie => this.setState({cookie}))
		fetch('/pretender/')
			.then(res => res.json())
			.then (pretender => this.setState({pretender}))
		fetch('/users/likes')
			.then(res => res.json())
			.then (likes => this.setState({likes}))
	}

	 addNotif = (data) => {
			fetch('/notif/create', {
			method: 'POST',
			body: JSON.stringify({ notified_uid: data.notified_uid , notifier_uid: data.notifier_uid ,notifier_login: data.notifier_login, notif_type: data.notif_type}),
			headers:{
				'Content-type': 'application/json'
			}
		})
	}

	addMatch = (pretenderUid, data) => {
		fetch('/match/create', {
			method: 'POST',
			body: JSON.stringify({pretenderUid: pretenderUid}),
			headers:{
				'Content-type': 'application/json'
			}
		})
		.then(res =>  res.json().then(data => ({status: res.status, body: data})))
		.then(res => {
			if (res.status === 200){
				this.updatePopularity();
				if (res.body.info === "match"){
					data.notif_type = "match"
					this.props.socket.emit('sendNotif', pretenderUid)
					this.props.socket.emit('sendNotif', this.state.cookie.uid)
					this.addNotif(data)
				}
			} else {
				const error = new Error(res.body.error);
				throw error;
			}
		})
		.catch(error => {
			alert(error);
		});
	}

	deleteMatch = (pretenderUid, data) => {
		fetch('/match/delete', {
			method: 'POST',
			body: JSON.stringify({pretenderUid: pretenderUid}),
			headers:{
				'Content-type': 'application/json'
			}
		})
		.then(res =>  res.json().then(data => ({status: res.status, body: data})))
		.then(res => {
			if (res.status === 200){
				this.updatePopularity();
				if (res.body.info === "unmatch"){
					data.notif_type = "unmatch"
					this.props.socket.emit('sendNotif', pretenderUid)
					this.addNotif(data)
				}
			} else {
				const error = new Error(res.body.error);
				throw error;
			}
		})
		.catch(error => {
			alert(error);
		});
	}

	updatePopularity = () => {
		fetch('/users/popularity')
	}
	
	onClick = (event, pretenderUid) => {
		event.preventDefault();
		fetch('/like/', {
			method: 'POST',
			body: JSON.stringify({likedUid: pretenderUid}),
			headers:{
				'Content-type': 'application/json'
			}
		})
		.then(res =>  res.json().then(data => ({status: res.status, body: data})))
		.then(res => {
			if (res.status === 200) {
				const data = {notifier_uid: this.state.cookie.info.uid, notified_uid: pretenderUid, notifier_login: this.state.cookie.info.login, notif_type: res.body.info}
				this.props.socket.emit('sendNotif', pretenderUid)
				this.addNotif(data);
				if (res.body.info === "like")
					this.addMatch(pretenderUid, data);
				else if (res.body.info === "unlike")
					this.deleteMatch(pretenderUid, data)
				fetch('/users/likes')
				.then(res => res.json())
				.then (likes => this.setState({likes}))
			} else {
				const error = new Error(res.body.error);
				throw error;
			}
		})
		.catch(error => {
			alert(error);
		});
	}

	render() {
		Moment.locale('fr');
		return (
			<div>
				<div style={{color:"red"}}>
				</div>
				<div className="cardContainer fade">
					
					{this.state.pretender.map(pretender =>
					<Link key={pretender.id} to={"profile/?uid=" + pretender.uid}>
						<Card className="item" key={ pretender.id }>
							<Card.Img className="myPic" variant="top" src= {process.env.PUBLIC_URL + pretender.path} />
							<div className="overlay">
								<Card.Title className="title">{ pretender.login }</Card.Title>
									<Card.Text>
										{ Moment().diff(pretender.birthday, 'years') } years old
										<br></br>
										{ pretender.gender.charAt(0).toUpperCase() + pretender.gender.slice(1) } { pretender.sexual_orientation.charAt(0).toUpperCase() + pretender.sexual_orientation.slice(1)}
										<br></br>
										Popularity: {pretender.popularity}
									</Card.Text>
									{this.state.likes.map(likes => 
										<Card.Text key={likes.id}> {likes.uid_liked === pretender.uid ?
											(<BsHeartFill onClick={(event) => {this.onClick(event, pretender.uid)}} style={{color: "#ff3333",  width: "30px", height: "30px", position: "absolute"}}/>) : null}

										</Card.Text>
									)}
									<BsHeart onClick={(event) => {this.onClick(event, pretender.uid)}} style={{color: "#ff3333", width: "30px", height: "30px", position: "absolute"}}/>
							</div>
						</Card>
						</Link>
					)}
				</div>
			</div>
		);
	}
}

export default Home;