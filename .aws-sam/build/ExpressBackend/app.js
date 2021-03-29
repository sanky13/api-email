const { MongoClient } = require('mongodb');
const{ ObjectId } = require('mongodb').ObjectId;
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const serverless = require('serverless-http');
let AWS = require('aws-sdk');
const params = {
	TableName: "emailsestracker-1"
};

AWS.config.update({ region: "ap-southeast-2" });


async function main() {
	let docClient = new AWS.DynamoDB.DocumentClient();
	try {
		await init(docClient);

	} catch (e) {
		console.error(e);
	}
}
main().catch(console.err);
 function sendemail() {
	
		// return ses.sendEmail(params).promise()
}

async function init(client) {
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true })); //extended:true to encode objects and arrays  https://github.com/expressjs/body-parser#bodyparserurlencodedoptions

	// const db = client.db('eventList')
	// const events = db.collection('events')


	app.get('/init', function (req, res) {
		// Call DynamoDB to add the item to the table

		const recordInitial ={
			emailId : 'mail2sanky@gmail.com',
			desc : "test email id",
			"quantity": "3",
			"delivery": "Home",
			"date": "2021-02-19 00:00"
		}
		params["Item"] = recordInitial
		console.log(params)
		client.put(params, function (err, data) {
			console.log(err)
			if (err) {
				res.send({
					success: false,
					message: err
				});
			} else {
				res.send({
					success: true,
					message: 'test data added',
					records: data
				});
			}
		});
		// res.send("Test events were added to the database")
	});

	app.get('/getList', function (req, res) {
		client.scan(params, function (err, data) {
			if (err) {
				console.log(err)
				res.send({
					success: false,
					message: err
				});
			} else {
				const { Items } = data;
				res.send(
					 Items
				);
			}
		});
		// events.find().toArray(function (err, data) {
		// 	//set the id property for all client records to the database records, which are stored in ._id field
		// 	for (var i = 0; i < data.length; i++){
		// 		data[i].id = data[i]._id;
		// 		delete data[i]["!nativeeditor_status"];
		// 	}
		// 	//output response
		// 	res.send(data);
		// });
	});


	// Routes HTTP POST requests to the specified path with the specified callback functions. For more information, see the routing guide.
	// http://expressjs.com/en/guide/routing.html

	app.post('/data', function (req, res) {

		var data = req.body;
		var sid = data.emailId;
		var tid = sid;
		var mode = data["mode"];
		console.log(req)
		console.log(mode)
		function update_response(err) {
			if (err)
				mode = "error";
			else if (mode == "inserted"){
				tid = data._id;
			}
			res.setHeader("Content-Type", "application/json");
			res.send({ action: mode, id: sid });
		}

		
		if (mode == "updated") {
			var params = {
				TableName: "emailsestracker-1",
				Key: {
					"emailId": data.emailId
				},
				Item: data,
				ReturnValues: "UPDATED_NEW"
			};

			console.log("Updating the item...");
			client.update(params, function (err, data) {
				if (err) {
					console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
				} else {
					console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
				}
				update_response();
			});
		} else if (mode == "inserted") {
			var params = {
				TableName: "emailsestracker-1",
				Key: {
					"emailId": data.emailId
				},
				Item: data,
			};
			var emailtemplatedata = {
				name : "Charan",
				receiptient: data.emailId,
				quantity : data.quantity
			};
			console.log("Inserting the item..." + params);
			var ses = new AWS.SES({ region: "ap-southeast-2" });
			var emailparams = {
				Destination: {
					ToAddresses: ["mail2sanky@gmail.com"],
				},
				Template: "Order-1",
				TemplateData: JSON.stringify(emailtemplatedata),
				Source: "mail2sanky@gmail.com",
			};
			console.log("sending email");
			ses.sendTemplatedEmail(emailparams, function (err, data) {
				console.log(" email send");
				if (err) console.log(err, err.stack); // an error occurred
				else console.log(data);           // successful response

				client.put(params, function (err, data) {
					if (err) {
						console.error("Unable to insert item. Error JSON:", JSON.stringify(err, null, 2));
					} else {
						console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
					}


					update_response();
				});
			});
			
		} else if (mode == "deleted") {
			var params = {
				TableName: "emailsestracker-1",
				Key: {
					"emailId": data.emailId
				},
				Item: data,
			};

			console.log("Deleting the item...");
			client.delete(params, function (err, data) {
				if (err) {
					console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
				} else {
					console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
				}
				update_response();
			});
		} else
			res.send("Not supported operation");
	});
};

// Binds listens for connections on the specified host and port. This method is identical to Node’s http.Server.listen().
module.exports.lambdaHandler = serverless(app);
 