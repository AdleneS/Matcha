import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

export default function withAuth(ComponentToProtect){

	return class extends Component{
		_isMounted = false;
		constructor(props){
			super(props);
			this.state = {
				loading: true,
				redirect: false,
			};
		}

		componentDidMount(){
			this._isMounted = true;
			fetch('/checkCookie')
				.then(res => {
					if (res.status === 200){
						this.setState({ loading: false });
					} else {
						const error = new Error(res.error);
						throw error;
					}
				})
				.catch(err => {
					this.setState({ loading: false, redirect: true});
				});
		}

		componentWillUnmount(){
			this._isMounted = false;
		}
		render(){
			const { loading, redirect } = this.state;
			if (loading){
				return null;
			}
			if (redirect){
				return <Redirect to="/login"/>;
			}
			return <ComponentToProtect {...this.props}/>
		}
	}
}