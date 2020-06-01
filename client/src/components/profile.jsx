import React, {Component} from 'react'
import "./profile.css";
import Image from 'react-bootstrap/Image'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { MdBlock, MdReport } from "react-icons/md";
import Carousel from 'react-bootstrap/Carousel'


class profile extends Component {
	constructor(props) {
		super(props);
		this.state = {
			user: [],
			likes: [],
			likes_you: [],
			gallery: [],
			is_like : 0,
			is_likes_you : 0
		};
		this.onClick = this.onClick.bind(this);
	}

    componentDidMount() {
        const queryString = window.location.search
        const urlParam = new URLSearchParams(queryString)
		fetch('/profile/'+urlParam.get('uid'))
			.then(response => response.json())
			.then (user => this.setState({user}, () => console.log('user fetched..', user)));
		fetch('/profile/like/'+urlParam.get('uid'))
			.then(res => res.json())
			.then (likes => this.setState({likes}, () => console.log("couocu likes : ", likes)))
			.then (likes => {
				if (this.state.likes[0] && this.state.user[0]) {
					if (this.state.likes[0].uid_liked === this.state.user[0].uid){
						this.setState({is_like : 1});
						console.log("test vous a like : ", this.state.likes);
					}
					else 
						this.setState({is_like : 0});
				} else {
					this.setState({is_like : 0});
				}
			})
			fetch('/profile/likeYou/'+urlParam.get('uid'))
				.then(response => response.json())
				.then (likes_you => this.setState({likes_you}, () => console.log('you like + =', likes_you)))
				.then (likes_you => {
					if (this.state.likes_you[0]) {
						this.setState({is_likes_you : 1});
					} else {
						this.setState({is_likes_you : 0});
					}
					console.log("is_you_likes = ", this.state.is_likes_you)
				})
		fetch('/profile/gallery/'+urlParam.get('uid'))
			.then(res => res.json())
			.then(gallery => this.setState({gallery}, () => console.log('gallery', gallery)));
	}
	
	onClick = (event, pretenderUid) => {
		const queryString = window.location.search
		const urlParam = new URLSearchParams(queryString)
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
				fetch('/profile/like/'+urlParam.get('uid'))
				.then(res => res.json())
				.then (likes => this.setState({likes}))
				if (this.state.likes[0]) {
					console.log("test 0:", this.state.likes[0]);
					if (this.state.likes[0].uid_liked === this.state.user[0].uid)
						this.setState({is_like : 0});
					else 
					this.setState({is_like : 1});
				} else {
					this.setState({is_like : 1});
				}
				console.log("test 1 :",  this.state.is_like)
			} else {
				const error = new Error(res.body.error);
				throw error;
			}
		})
			.catch(err => {
			alert(err);
		});
	}


	render(){
		return (
			<div>
				<Container>
				{this.state.user.map(user => 
				<div key={user.id}>
				<div className="test containerDivProfile"></div>
					<Container fluid>
					<Row className="test block">
						<Col md={3}>
								<Image className="img_size" src= {process.env.PUBLIC_URL + user.path} roundedCircle/>
						</Col>
						<Col>
							<Row>
								<h1 className="test">{user.login}</h1>
							</Row>
							<Row>
								<p>{user.gender}</p>
							</Row>
							<Row>
								<p>{user.sexual_orientation}</p>
							</Row>
						</Col>
					</Row>
					<Row className="test">
						<Col className="test block">
							{this.state.is_like === 1 ?
										(<BsHeartFill onClick={(event) => {this.onClick(event, user.uid)}} style={{ marginTop: "10px", color: "#ff3333",  width: "30px", height: "30px", position: "absolute"}}/>) : null}
							<BsHeart onClick={(event) => {this.onClick(event, user.uid)}} style={{marginTop: "10px", color: "#ff3333", width: "30px", height: "30px", position: "absolute"}}/>
							<div style={{marginLeft: "40px",  marginTop: "10px"}}>
								{this.state.is_likes_you === 1 ? (<p>{user.login} vous a like</p>) : null}
							</div>
						</Col>
						<Col className="test block">
							<div style={{marginTop: "10px"}}>
								{(<p>565632</p>)}
							</div>
						</Col>
						<Col className="test block">
								<MdBlock style={{color: "#ff3333", width: "30px", height: "30px", position: "absolute",  marginTop: "10px"}}/>
								<MdReport style={{color: "#ff3333", width: "30px", height: "30px", position: "absolute", marginLeft: "40px", marginTop: "10px"}}/>

						</Col>
					</Row>

					<Row className="test block" style={{height: "140px"}}>
						<p>{user.description}</p>
					</Row>
					
					<Row>

					<Carousel>
					{this.state.gallery.map(gallery =>
  						<Carousel.Item>
  						  <img
  						    className="d-block w-100 h-100 img_size"
  						    src={process.env.PUBLIC_URL + gallery.path}
  						    alt="First slide"
  						  />
  						  <Carousel.Caption>
  						    <h3>First slide label</h3>
  						    <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
  						  </Carousel.Caption>
  						</Carousel.Item>
					)}
						</Carousel>
							
					</Row>
					</Container>
					</div>
                )}
				</Container>
			</div>
		)
	}
}


export default profile;