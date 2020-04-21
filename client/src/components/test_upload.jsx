import React, {Component} from 'react'

class Test_upload extends Component {
	state = {
		file:null
	};

	onFileChange = event => {
		this.setState({ file: event.target.files[0]});
	};



	onSubmit = (e) => {
		e.preventDefault();
		console.log("submited")
		const formData = new FormData()
		formData.append('file', this.state.file, this.state.file.name);
		fetch('/imgupload', {
		  method: 'POST',
		  body: formData
		})
		.then(response => response.json())
		.then(data => {
		  console.log(data)
		})
		.catch(error => {
		  console.error(error)
		})
	}

	render(){
		return (
			<div>
				<form  onSubmit={this.onSubmit}>
					<input type="file" name="file" onChange={this.onFileChange}/>
					<input type="submit"/>
				</form>
			</div>
		)
	}
}

export default Test_upload;
