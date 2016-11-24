import TextField from 'material-ui/TextField';
import React from 'react';
import ReactDOM from 'react-dom';

var TransactionBox = React.createClass({
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
			<div className="transactionBox">
					<h3>Balance:</h3>
					<Balance balance={this.state.balance}/>
					<h3>Transactions:</h3>
					<TransactionList transactions={this.state.transactions}/>
					<TransactionForm submitTransaction={this.submitTransaction}/>
					<Mine mine={this.onMineRequest}/>
			</div>
		);
	}
});
var TransactionList = React.createClass({
	render: function () {
		var Transactions = (<div>Loading transactions...</div>);
		if (this.props.transactions) {
			Transactions = this.props.transactions.map(function (transaction) {
				return (<Transaction transaction={transaction} />);
			});
		}
		return (
			<div className="transactionList">
				{Transactions}
			</div>
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
				<span className="payer">{this.props.transaction.payer}</span> paid:<br/>
				<span className="amount">{this.props.transaction.amount}</span> to <br/>
				<span className="receiver">{this.props.transaction.receiver}</span> <br/>
			</div>
		);
	}
});
var TransactionForm = React.createClass({
	handleSubmit: function (e) {
		e.preventDefault();
		var that = this;
		var payer = this.refs.payer.getDOMNode().value;
		var amount = this.refs.amount.getDOMNode().value;
		var receiver = this.refs.receiver.getDOMNode().value;
		var transaction = { payer: payer, amount: amount, receiver: receiver};
		var submitButton = this.refs.submitButton.getDOMNode();
		submitButton.innerHTML = 'Posting transaction...';
		submitButton.setAttribute('disabled', 'disabled');
		this.props.submitTransaction(transaction, function (err) {
			that.refs.payer.getDOMNode().value = '';
			that.refs.amount.getDOMNode().value = '';
			that.refs.receiver.getDOMNode().value = '';
			submitButton.innerHTML = 'Post transaction';
			submitButton.removeAttribute('disabled');
		});
	},
	render: function () {
		return (
			<form className="transactionForm" onSubmit={this.handleSubmit}>
				<input type="text" name="payer" ref="payer" placeholder="Payer" required /><br/>
				<input type="number" step="any" name="amount" ref="amount" placeholder="Amount" required /><br/>
				<input type="text" name="receiver" ref="receiver" placeholder="Receiver" required /><br/>
				<button type="submit" ref="submitButton">Post transaction</button>
			</form>
		);
	}
});
var Mine = React.createClass({
	handleSubmit: function (e) {
		e.preventDefault();
		var that = this;
		var submitButton = this.refs.mineButton.getDOMNode();
		submitButton.innerHTML = 'Mining...';
		submitButton.setAttribute('disabled', 'disabled');
		this.props.mine('john', function (err) {
			submitButton.innerHTML = 'Mine';
			submitButton.removeAttribute('disabled');
		});
	},
	render: function () {
		return (
			<form className="mineForm" onSubmit={this.handleSubmit}>
				<button type="submit" ref="mineButton">Mine</button>
			</form>
		);
	}
});
alert('rendered');
ReactDOM.render(
	<TransactionBox/>,
	document.getElementById('content')
);
