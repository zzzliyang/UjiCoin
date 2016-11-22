var path = require('path');
var fs = require('fs');
var express = require('express');
var _ = require('underscore');

// Server part
var app = express();
app.use('/', express.static(path.join(__dirname, 'app')));

var server = app.listen(3000);
console.log('Server listening on port 3000');

// Socket.IO part
var io = require('socket.io')(server);

var sendTransactions = function (socket) {
	fs.readFile('_transactions.json', 'utf8', function(err, transactions) {
		transactions = JSON.parse(transactions);
		socket.emit('transactions', transactions);
	});
};

var calculateBalance = function (socket, user) {
	fs.readFile('_ledger_' + user + '.json', 'utf8', function(err, transactions) {
		transactions = JSON.parse(transactions);
		var balance = 0;
		_.each(transactions, function(transaction) {
		  if (transaction.payer === 'liyang') {
				balance -= parseFloat(transaction.amount);
			}	else if (transaction.receiver === 'liyang') {
				balance += parseFloat(transaction.amount);
			}
		});
		socket.emit('balance', balance);
	});
};

var validateTransactions = function (transactions) {
	return true;
}

var mine = function (socket, user, callback) {
	fs.readFile('_transactions_' + user + '.json', 'utf8', function(err, newTransactions) {
		newTransactions = JSON.parse(newTransactions);
		if (validateTransactions(newTransactions)) {
			fs.readFile('_ledger_' + user + '.json', 'utf8', function(err, transactions) {
				if (err) {
					console.log("Are you kidding me. You don't even have a ledger.");
				} else {
					transactions = JSON.parse(transactions);
					transactions = transactions.concat(newTransactions);
					fs.writeFile('_ledger_' + user + '.json', JSON.stringify(transactions, null, 4), function (err) {
						callback(err);
					});
				}
			});
			fs.writeFile('_transactions_' + user + '.json', '', function (err) {
				callback(err);
			});
		}
		socket.emit('newBlock');
	});
};

io.on('connection', function (socket) {
  console.log('New client connected!');

	socket.on('fetchTransactions', function () {
		sendTransactions(socket);
	});

	socket.on('fetchBalance', function (user) {
		calculateBalance(socket, user);
	});

	socket.on('mineRequest', function (user, callback) {
		mine(socket, user, callback);
	});

	socket.on('newTransaction', function (transaction, callback) {
		fs.readFile('_transactions_liyang.json', 'utf8', function(err, transactions) {
			if (err) {
				fs.writeFile('_transactions_liyang.json', '', function(err) {
          if(err) {
              console.log(err);
          }
          console.log("The file was saved!");
      	});
				var transactions = [transaction];
				fs.writeFile('_transactions_liyang.json', JSON.stringify(transactions, null, 4), function (err) {
					io.emit('transactions', transactions);
					callback(err);
				});
			} else {
				transactions = JSON.parse(transactions);
				transactions.push(transaction);
				fs.writeFile('_transactions_liyang.json', JSON.stringify(transactions, null, 4), function (err) {
					io.emit('transactions', transactions);
					callback(err);
				});
			}
		});
	});
});
