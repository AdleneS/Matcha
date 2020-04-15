import React, { Component } from 'react';
import Moment from 'moment';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import './home.css';

class Pretender extends Component {
	constructor(props){
		super(props);
		this.state = {
			pretender: []
		}
	}
	
	componentDidMount(){
		fetch('/users/')
			.then(res => res.json())
			.then (pretender => this.setState({pretender}, () => console.log('pretender fetched..',
			pretender)));
	}
	render() {
		Moment.locale('fr');
		return (
			<div className="">
				<div className="cardContainer">
					{this.state.pretender.map(pretender =>
						<Card key={ pretender.id } style={{ width: '15rem', margin: '10px'}}>
						<Card.Img variant="top" src="holder.js/200px180" />
						<Card.Body>
							<Card.Title>{ pretender.login }</Card.Title>
								<Card.Text>
									{ Moment(pretender.date).format('DD/MM/YYYY') }
								</Card.Text>
							<Button variant="primary">Go somewhere</Button>
						</Card.Body>
						</Card>)
					}
				</div>
			</div>
		);
	}
}

export default Pretender;