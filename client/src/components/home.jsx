import React, { Component } from 'react';
import Moment from 'moment';
import Card from 'react-bootstrap/Card';
import {Link} from 'react-router-dom';
import './home.css';
import "./animation.css";
import { BsHeart, BsHeartFill } from "react-icons/bs";

class Pretender extends Component {
	constructor(props){
		super(props);
		this.state = {
			pretender: []
		}
		this.onClick = this.onClick.bind(this);
	}

	componentDidMount(){
		fetch('/pretender/')
			.then(res => res.json())
			.then (pretender => this.setState({pretender}, () => console.log('pretender fetched..',
			pretender)));
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
			console.log(res);
			console.log("Responses:", res);
			if (res.status === 200) {

			} else {
				const error = new Error(res.body.error);
				throw error;
			}
		})
			.catch(err => {
			alert(err);
		});
	}

	render() {
		Moment.locale('fr');
		return (
			<div>
				<div className="cardContainer fade">
					{this.state.pretender.map(pretender =>
					<Link key={pretender.id} to={"#/user/page/" + pretender.id}>
						<Card className="item" key={ pretender.id } style={{ width: '15rem', margin: '10px'}}>
						<Card.Img className="myPic" variant="top" src= {process.env.PUBLIC_URL + pretender.path} />
						<div className="overlay">
							<Card.Title className="title">{ pretender.login }</Card.Title>
								<Card.Text>
									{ Moment(pretender.birthday).format('DD/MM/YYYY') }
									<br></br>
									{ pretender.gender.charAt(0).toUpperCase() + pretender.gender.slice(1) } { pretender.sexual_orientation.charAt(0).toUpperCase() + pretender.sexual_orientation.slice(1)}
								</Card.Text>
									<BsHeart onClick={(event) => {this.onClick(event, pretender.uid)}} style={{color: "#ff3333", width: "30px", height: "30px", position: "absolute"}}/>
									<BsHeartFill onClick={(event) => {this.onClick(event, pretender.uid)}} style={{color: "#ff3333",  width: "30px", height: "30px"}}/>
						</div>
						</Card>
						</Link>
					)}
				</div>
			</div>
		);
	}
}

export default Pretender;