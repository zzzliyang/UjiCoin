import TextField from 'material-ui/TextField';
import React from 'react';
import ReactDOM from 'react-dom';

var LoginForm = React.createClass({
  componentDidMount: function () {
    var that = this;
    this.socket = io();
    this.socket.on('success',(data)=>{
      console.log(data);
      // if(data==='success'){
        window.location='login.html';
      // }
    })
  },
	handleSubmit: function (e) {
		e.preventDefault();
		var that = this;
		var user = this.refs.user.value;
		var password = this.refs.password.value;
		var login = { user: user, password: password};
		console.log(login);
		var loginButton = this.refs.loginButton;
		loginButton.innerHTML = 'Please log in';
		loginButton.setAttribute('disabled', 'disabled');
		this.processLogin(login, function (err) {
			that.refs.user.value = '';
			that.refs.password.value = '';
			loginButton.innerHTML = 'Logged in';
			loginButton.removeAttribute('disabled');
		});
	},

  processLogin: function(login, callback){
    this.socket.emit('loginRequest', login, function (err) {
      if (err)
        return console.error('Login error:', err);
      callback();
    });
  },

	render: function () {
		return (
			<form className="loginForm" onSubmit={this.handleSubmit}>
				<input type="text" name="user" ref="user" placeholder="UserName" required /><br/>
				<input type="password" name="password" ref="password" placeholder="Password" required /><br/>
				<button type="submit" ref="loginButton">Login</button>
			</form>
		);
	}
});

ReactDOM.render(
	<LoginForm/>,
	document.getElementById('content')
);
