//Require our dependencies
var express = require("express");
var mongoose = require("mongoose");
var expressHandlebars = require("express-handlebars");
var bodyParser = require("body-parser");

//Set up the port to be port 3000
var PORT = process.env.PORT || 3000;

//Instantiate the Express App
var app = express();

//Set up the Express Router
var router = express.Router();

//Designate the public folder as a static directory
app.use(express.static(__dirname + "/public"));

//Connect Handlebars to the Express app
app.engine("handlebars", expressHandlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

//Use bodyParser in our app
app.use(bodyParser.urlencoded({
    extended:false
}));

//Have every request go through the router middleware
app.use(router);

//If deployed, use the deployed database.  Otherwise use the local mongoHeadlines database
var db = process.env.MONGODB_URI ||"mongodb://localhost/mongoHeadlines";

//Connect mongoose to our database
mongoose.connect(db, function(error) {
    //Log any errors connecting with mongoose
    if (error) {
        console.log(error);
    }
    //Or log a success message
    else {
        console.log("mongoose connection is successful");
    }
});

//Listen on the port
app.listen(PORT, function() {
    console.log("Listening on port:" + PORT);
});