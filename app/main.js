import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

var MyApp = React.createClass({
	getInitialState: function () {
		return {
			transactions: null,
			balance: 0
		};
	},
	componentDidMount: function () {
		var that = this;
		this.socket = io();
		this.socket.on('balance', function (balance) {
			that.setState({ balance: balance });
		});
		this.socket.emit('fetchBalance', 'liyang');
	},
	fetchTransactions: function (user) {
		var that = this;
		this.socket = io();
		this.socket.on('transactions', function (transactions) {
			that.setState({ transactions: transactions });
		});
		this.socket.emit('fetchTransactions', user);
	},
	submitTransaction: function (transaction, callback) {
		this.socket.emit('newTransaction', transaction, function (err) {
			if (err)
				return console.error('New transaction error:', err);
			callback();
		});
	},
	onMineRequest: function (user, callback) {
		this.socket.emit('mineRequest', user, function (err) {
			if (err)
				return console.error('Mining error:', err);
			callback();
		});
	},
	render: function() {
		return (
			<MuiThemeProvider>
				<div className="transactionBox">
						<h3>Balance:</h3>
						<Balance balance={this.state.balance}/>
						<h3>Transactions:</h3>
						<TransactionList transactions={this.state.transactions} fetchTransactions={this.fetchTransactions}/>
						<TransactionForm submitTransaction={this.submitTransaction}/>
						<Mine mine={this.onMineRequest}/>
				</div>
		  </MuiThemeProvider>
		);
	}
});
var Balance = React.createClass({
	render: function () {
		return (
			<div className="balance">
				<span className="balance">{this.props.balance}</span>
			</div>
		);
	}
});
var Transaction = React.createClass({
	render: function () {
		return (
			<div className="transaction">
				<span className="payer">{this.props.transaction.payer}</span> paid:
				<span className="amount">{this.props.transaction.amount}</span> to 
				<span className="receiver">{this.props.transaction.receiver}</span> 
			</div>
		);
	}
});
var TransactionForm = React.createClass({
	getInitialState: function () {
		return {
			payer: '',
			amount: '',
			receiver: '',
			buttonDisabled: false
		};
	},
	handleSubmit: function (e) {
		e.preventDefault();
		var that = this;
		var payer = this.refs.payer.getValue();
		var amount = this.refs.amount.getValue();
		var receiver = this.refs.receiver.getValue();
		var transaction = { payer: payer, amount: amount, receiver: receiver};
		var submitButton = this.refs.submitButton;
		submitButton.setState({buttonDisabled:true});
		this.props.submitTransaction(transaction, function (err) {
			that.setState({payer:''})
			that.setState({amount:''})
			that.setState({receiver:''})
			submitButton.setState({buttonDisabled:false});
		});
	},
	handlePayerChange: function (event) {
	    event.preventDefault();
	    this.setState({
	      payer: event.target.value,
	    });
	},
	handleAmountChange: function (event) {
	    event.preventDefault();
	    this.setState({
	      amount: event.target.value,
	    });
	},
	handleReceiverChange: function (event) {
	    event.preventDefault();
	    this.setState({
	      receiver: event.target.value,
	    });
	},
	render: function () {
		return (
			<form className="transactionForm" onSubmit={this.handleSubmit}>
				<TextField
					floatingLabelText="payer" ref="payer" value={this.state.payer} onChange={this.handlePayerChange}
				/><br />
				<TextField
					floatingLabelText="amount" ref="amount" value={this.state.amount} onChange={this.handleAmountChange}
				/><br />
				<TextField
					floatingLabelText="receiver" ref="receiver" value={this.state.receiver} onChange={this.handleReceiverChange}
				/><br />
				<RaisedButton label="Post transaction" type="submit" ref="submitButton" disabled={this.state.buttonDisabled}/>
			</form>
		);
	}
});
var Mine = React.createClass({
	getInitialState: function () {
		return {
			buttonDisabled: false
		};
	},
	handleSubmit: function (e) {
		e.preventDefault();
		var submitButton = this.refs.mineButton;
		submitButton.setState({buttonDisabled: true})
		this.props.mine('john', function (err) {
			submitButton.setState({buttonDisabled: false})
		});
	},
	render: function () {
		return (
			<form className="mineForm" onSubmit={this.handleSubmit}>
				<RaisedButton 
				    label="Mine" 
				    type="submit" 
				    ref="mineButton" 
				    disabled={this.state.buttonDisabled}
				    primary={true}
				    />
			</form>
		);
	}
});
var TransactionList = React.createClass({
	getInitialState: function () {
		return {
			buttonDisabled: false
		};
	},
	handleSubmit: function (e) {
		e.preventDefault();
		var submitButton = this.refs.transactionButton;
		submitButton.setState({buttonDisabled: true});
		this.props.fetchTransactions('john', function (err) {
			submitButton.setState({buttonDisabled: false});
			submitButton.setState({label: "Hide Transactions"});
		});
	},
	render: function () {
		var Transactions = (<div/>);
		if (this.props.transactions) {
			Transactions = this.props.transactions.map(function (transaction) {
				return (<Transaction transaction={transaction} />);
			});
		}
		return (
			<div className="transactionList">
				<form className="transactionForm" onSubmit={this.handleSubmit}>
					<RaisedButton 
					    label="Load Transactions"
					    type="submit" 
					    ref="transactionButton" 
					    disabled={this.state.buttonDisabled}
					    primary={true}
					    />
				</form>
				{Transactions}
			</div>
		);
	}
});

ReactDOM.render(
	<MyApp/>,
	document.getElementById('content')
);
