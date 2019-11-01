const express = require('express')
const app = express();
const port = 8000
const path = require('path');
const dao = require('./database')
    
    var bodyParser = require("body-parser");
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Set static folder
    app.use(express.static(path.join(__dirname, 'public')));

    // Start server
    app.listen(port, () => {
        console.log("Server running on port %PORT%".replace("%PORT%",port))
    });
    // Root endpoint
    app.get("/", (req, res, next) => {
        res.json({"message":"Ok"})
    });

    // Insert here other API endpoints
    // Members api routes
    app.use('/api/members', require('./routes/api/members'));
    
    app.use('/api' , require('./routes/api/actions'))

    // Default response for any other request
    app.use(function(req, res){
        res.status(404);
    });


