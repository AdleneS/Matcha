import React, { Component } from 'react';
import Moment from 'moment';
import Card from 'react-bootstrap/Card';
import {Link} from 'react-router-dom';
import './home.css';
import "./animation.css";

class Pretender extends Component {
	constructor(props){
		super(props);
		this.state = {
			pretender: []
		}
	}

	componentDidMount(){
		fetch('/pretender/')
			.then(res => res.json())
			.then (pretender => this.setState({pretender}, () => console.log('pretender fetched..',
			pretender)));
	}
	render() {
		Moment.locale('fr');
		
		return (
			<div>
				<div className="cardContainer fade">
					{this.state.pretender.map(pretender =>
					<Link to={"#/user/page/" + pretender.id}>
						<Card className="item" key={ pretender.id } style={{ width: '15rem', margin: '10px'}}>
						<Card.Img className="myPic" variant="top" src= {process.env.PUBLIC_URL + pretender.path} />
						<div className="overlay">
							<Card.Title className="title">{ pretender.login }</Card.Title>
								<Card.Text>
									{ Moment(pretender.birthday).format('DD/MM/YYYY') }
									<br></br>
									{ pretender.gender.charAt(0).toUpperCase() + pretender.gender.slice(1) } { pretender.sexual_orientation.charAt(0).toUpperCase() + pretender.sexual_orientation.slice(1)}
								</Card.Text>
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