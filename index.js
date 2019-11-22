const express = require('express')
const app = express();
const port = process.env.PORT || 8000;
const path = require('path');
const cors = require('cors');

    // Enable cors requests
    app.use(cors());
    
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
    // Actions' routes
    app.use('/api', require('./routes/api/actions'));

    // RPC route
    app.use('/', require('./routes/rpc/rpc'));

    // Default response for any other request
    app.use(function(req, res){
        res.status(404);
    });






