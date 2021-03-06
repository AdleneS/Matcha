import React, {Component} from 'react'
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Image from 'react-bootstrap/Image'
import "./change_info.css";

class Test_upload extends Component {
	constructor (props) {
		super(props);
		this.state = {
			file:null,
			tmp_file: null,
			login:'',
			email:'',
			name:'',
			surname:'',
			birthday: '',
			gender:'',
			sexual_orientation:'',
			description: '',
			addTag: '',
			tag: [],
			image: []
		};
		this.handleInputChange = this.handleInputChange.bind(this);
	}

	componentDidMount () {
		fetch('/change/tag')
			.then(response => response.json())
			.then(tag => this.setState({tag}, () => console.log('tag = ', tag)));
		fetch('/change/sortImage')
			.then(response => response.json())
			.then(image => this.setState({image}, () => console.log('image = ', image)));
	}

	onClickImg = (event, image) => {
		event.preventDefault()
		console.log('test del image : ', image)
		fetch('/change/deleteImage', {
			method: 'POST',
			body: JSON.stringify({img: image}),
			headers:{
				'Content-type': 'application/json'
			}
		})
			.then(response => response.json())
		fetch('/change/sortImage')
			.then(response => response.json())
			.then(image => this.setState({image}, () => console.log('image = ', image)));
	}

	onClick = (event, tag_delete) => {
		event.preventDefault()
		fetch('change/deleteTag', {
			method: 'POST',
			body: JSON.stringify({tag: tag_delete}),
			headers:{
				'Content-type': 'application/json'
			}
		})
			.then(response => response.json())
		fetch('/change/tag')
			.then(response => response.json())
			.then(tag => this.setState({tag}, () => console.log('tag = ', tag)));
	}

	handleInputChange = (event) => {
		event.preventDefault()
		const name = event.target.name;
		this.setState({[name] : event.target.value}, () => console.log(this.state));
	}

	onFileChange = event => {
		event.preventDefault()
		this.setState({ file: event.target.files[0] }, () => {
			if (this.state.file) {
				this.setState({tmp_file: URL.createObjectURL(this.state.file)})
			}
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		console.log("submited")
		if (this.state.file) {
			const formData = new FormData()
			formData.append('file', this.state.file, this.state.file.name);
			fetch('/imgupload', {
			  method: 'POST',
			  body: formData
			})
			.then(response => response.json())
			.then(data => {
			  console.log("lol", data)
			})
			.catch(error => {
			  console.error("error", error)
			})
		}
		fetch('/change/login', {
			method: 'POST',
			body: JSON.stringify(this.state),
			headers:{
				'Content-type': 'application/json'
			}
		})
		.then(response =>  response.json().then(data => ({status: response.status, body: data})))
		.then(response => {
			if (response.status === 200) {
				console.log(response.body.info)
			} else {
				console.log('fail', response.body.info)
			}
		})
		fetch('/change/tag')
			.then(response => response.json())
			.then(tag => this.setState({tag}));
		fetch('/change/sortImage')
			.then(response => response.json())
			.then(image => this.setState({image}));
		
	}

	render(){
		return (
			<div>
				<div className="container containerChange">
					<form onSubmit={this.onSubmit}>
						<Form.Row>
							<Form.Group as={Col}>
								<Form.Label>Name</Form.Label>
								<Form.Control type="text" name="name" value={this.state.name} placeholder="change your name" onChange={(event) => {this.handleInputChange(event)}}></Form.Control>
							</Form.Group>
							<Form.Group as={Col}>
								<Form.Label>First Name</Form.Label>
								<Form.Control type="text" name="surname"  value={this.state.surname} placeholder="change your surname" onChange={(event) => {this.handleInputChange(event)}}></Form.Control>
							</Form.Group>
						</Form.Row>
						<Form.Row>
							<Form.Group as={Col}>
								<Form.Label>Login</Form.Label>
								<Form.Control type="text" name="login" value={this.state.login} onChange={(event) => {this.handleInputChange(event)}} placeholder="change your login"></Form.Control>
							</Form.Group>
							<Form.Group as={Col}>
								<Form.Label>Email</Form.Label>
								<Form.Control type="email" name="email"  value={this.state.email} onChange={(event) => {this.handleInputChange(event)}}placeholder="change your email"></Form.Control>
							</Form.Group>
						</Form.Row>
							<Form.Group controlId="birthday">
								<Form.Label>Birthday</Form.Label>
								<Form.Control type="date"  value={this.state.birthday} placeholder="Enter email" onChange={(event) => {this.handleInputChange(event)}} name="birthday"/>
							</Form.Group>
						<Form.Row>
							<Form.Group as={Col} controlId="gender">
								<Form.Label>Gender</Form.Label>
								<Form.Control as="select" custom name="gender" value={this.state.gender} onChange={(event) => {this.handleInputChange(event)}}>
									<option>Man</option>
									<option>Woman</option>
									<option>Other</option>
								</Form.Control>
							</Form.Group>
							<Form.Group as={Col} controlId="sexual_orientation">
								<Form.Label>Sexual Orientation</Form.Label>
								<Form.Control as="select" custom name="sexual_orientation" value={this.state.sexual_orientation} onChange={(event) => {this.handleInputChange(event)}}>
									<option>Heterosexual</option>
									<option>Homosexual</option>
									<option>Bisexual</option>
								</Form.Control>
							</Form.Group>
				</Form.Row>
				<Form.Group controlId="exampleForm.ControlTextarea1">
					<Form.Label>Description</Form.Label>
					<Form.Control as="textarea" rows="3" name="description" onChange={(event) => {this.handleInputChange(event)}} />
				</Form.Group>
				<Form.Group>
					<Form.Label>Tag</Form.Label>
					<Form.Control type="text" name="addTag" onChange={(event) => {this.handleInputChange(event)}} placeholder="add interest tag"/>
				</Form.Group>

					<div style={{marginBot: "50px"}}>
						{this.state.tag.map(tag => 
							<h5 key={tag.id} style={{display: "inline-block", marginRight: "5px"}}>
								<Badge pill variant="dark" onClick={(event) => {this.onClick(event, tag.tag)}}>{tag.tag}</Badge>
							</h5>
						)}
					</div>

					<Form.Group className="fileInput">
						 <Form.File 
							className="fileInput"
							id="custom-file-translate-scss"
							name="file"
							type="file"
 						   	label="Custom file input"
							lang="en"
							onChange={this.onFileChange}
 						   	custom
 							 />
					</Form.Group>

					<Form.Group>

						{this.state.image.map(image =>
							<div key={image.id} className='thumbnail'>
								<Image src={process.env.PUBLIC_URL + image.path} style={{objectFit: "cover", width: "100%", height: "200px"}} onClick={(event) => {this.onClickImg(event, image.n_pic)}} rounded/>
							</div>
						)}
						{!this.state.tmp_file ? null :
							<div className="thumbnail">
								<Image src={this.state.tmp_file} style={{objectFit: "cover", width: "100%", height: "200px"}} rounded/>
							</div>
						}
					</Form.Group>
						<Button variant="dark" type="submit" size="lg" className="submitChange" block style={{marginBottom: '20px'}}>Submit</Button>
				</form>
				</div>
			</div>
		)
	}
}


export default Test_upload;
