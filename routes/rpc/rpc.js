const express = require('express');
const router = express.Router();
const db = require('../../database')
const functions = require('./functions')

// RPC SERVER
// Not a classic rpc. This rpc uses slightly webservices for easiest connection with clients [basicly JSONrpc].
// There's a specific address for clients to request rpc calls [localhost:8000/rpc]
// They can only do POST calls and in these calls they have to specify what method they want to run.
// They must pass down the method through body's request as you can see below. (as json data)

// When a request arrives, this method checks request's parameter named "method"
// and runs a specific part of code. [METHOD]
router.post('/rpc', (req, res) => {

    if(req.body.method === "balance")
        balance(req, res);
    else if(req.body.method === "withdraw")
        withdraw(req, res);
    else if(req.body.method === "deposit")
        deposit(req, res);
    else if(req.body.method === "getUser")
        getUser(req, res);
    else {
        // Error catching in case of bad request
        if(req.body.method !== undefined){
        res.status(400).json({"error":"Probably method " + req.body.method + " doesn't exist in this server."});
            return;
        }
        else {
            res.status(400).json({"error":err.message})
        }
    }

})

// Get User Method
// REQUIREMENTS
/*  body : {
        method : "getUser"
        id : ...
    }
*/ 
function getUser(req, res){

    var sql = "select * from atm where id = ?"
    var params = [req.body.id]
    // Request user from db
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        // If there's no user with id of...
        if(row === undefined){
            res.json({
                "message":"error",
                "error":("No user with id " + req.params.id)
            })
        }
        // If everything's fine
        else{
            res.json({
                "message":"success",
                "data":row
            })
        }
      });
}

// Balance Method
// REQUIREMENTS
/*  body : {
        method : "balance"
        id : ...
    }
*/ 
function balance(req, res){
    // sqlite query
    var sql = "select balance from atm where id = ?";
    var params = [req.body.id];
    // Get balance from SQLite db
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        if(row === undefined){
            // If user doesn't exist, returns error message
            res.status(400).send({
                "message":"error",
                "error":("No user with id " + req.body.id)
            })
        }
        else {
            // If everything works well, return user's balance
            res.json({
                "message":"success",
                "data":row
            })
        }
      });
}

// Withdraw method
// REQUIREMENTS
/*  body : {
        method : "withdraw"
        id : ...
        amount : ...
    }
*/ 
function withdraw(req, res){
    var sql = "select * from atm where id = ?"
    var params = [req.body.id]
    db.get(sql, params, (err, row) => {
        if (err) {
            // If db get won't work inform client
            res.status(400).json({"error":err.message});
            return;
        }
        else{
            // Method that checks if daily limit needs to be reseted
            functions.resetDailyLimit(req.body.id, row.date);

            if(functions.isNewBalancePositive(row.balance,parseInt(req.body.amount)) && functions.isLimitReached(row.daily_limit,parseInt(req.body.amount))){

                if(functions.canBeDivided(req.body.amount)){
                    newBalance = row.balance - req.body.amount;
                    newDailyLimit = parseInt(row.daily_limit) + parseInt(req.body.amount);

                    // Sets today's date
                    date = new Date();
                    day = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

                    // Run db to update balance, limit and date of transaction for the given user
                    db.run(
                        `UPDATE atm set 
                        balance = COALESCE(?,balance),
                        daily_limit = COALESCE(?,daily_limit),
                        date = COALESCE(?,date)
                        WHERE id = ?`,
                        [newBalance, newDailyLimit, day, req.body.id],
                        function (err, result) {
                            if (err){
                                res.status(400).json({"error": res.message})
                                return;
                            }
                            res.json({
                                message: "success",
                                balance: newBalance
                            })
                    });
                }
                else {
                    res.status(400).send({
                        message: "error",
                        error: "Λάθος ποσό!"
                    })
                }
            }
            else {
                // Error for reaching daily limit
                if(row.daily_limit === 2000){
                    res.status(400).send({
                        message: "error",
                        error: "Έφτασες το μέγιστο όριο ημερήσιας ανάληψης!"
                    })
                } else {
                    // Error for wrong amount requested
                    res.status(400).send({
                        message: "error",
                        error: "Λάθος ποσό!"
                    })
                }
            }
        }
      });
}

// Deposit Method
// REQUIREMENTS
/*  body : {
        method : "deposit"
        id : ...
        amount : ...
    }
*/ 
function deposit(req,res){
    var sql = "select * from atm where id = ?"
    var params = [req.body.id]

        db.get(sql, params, (err, row) => {
            if (err) {
                // If db get won't work inform client
                res.status(400).json({"error":err.message});
                return;
            }
            else{
                // User can only deposit amounts with bills, no coins
                if(parseInt(req.body.amount)%5 == 0){
    
                    newBalance = parseInt(row.balance) + parseInt(req.body.amount);
    
                    // Update user's balance
                    db.run(
                        `UPDATE atm set 
                        balance = COALESCE(?,balance)
                        WHERE id = ?`,
                        [newBalance, req.body.id],
                        function (err, result) {
                            if (err){
                                res.status(400).json({"error": res.message})
                                return;
                            }
                            else {
                                res.json({
                                    message: "success",
                                    balance: newBalance
                                })
                            }
                        });
                }
                else{
                    // Inform user if the given amount is wrong
                    res.status(400).send({
                        message: "error",
                        error: "Λάθος ποσό! Το ποσό κατάθεσης πρέπει να είναι πολλαπλάσιο του 5."
                    })
                }
            }
        });
    }



module.exports = router;