const express = require('express');
const router = express.Router();
const db = require('../../database')

// Returns user's balance
// [GET METHOD],[PARAMETERS] => ID (in request's headers section)
router.get('/balance', (req, res) => {

    // sqlite query
    var sql = "select balance from atm where id = ?";
    var params = [req.headers.id];
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
                "error":("No user with id " + req.headers.id)
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

});

// [POST METHOD],[PARAMETERS] => ID, AMOUNT (in request's body section)
// [RESPONSE] => MESSAGE("ERROR" OR "SUCCESS"), DATA(BALANCE)
// Withdraws a given amount from a given user
router.post('/withdraw', (req, res) => {
    // SQLite query , returns user's row for a given id
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
            resetDailyLimit(req.body.id, row.date);

            if(isNewBalancePositive(row.balance,parseInt(req.body.amount)) && isLimitReached(row.daily_limit,parseInt(req.body.amount))){

                if(canBeDivided(req.body.amount)){
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
                if(row.daily_limit === 2000){
                    res.status(400).send({
                        message: "error",
                        error: "Έφτασες το μέγιστο όριο ημερήσιας ανάληψης!"
                    })
                } else {
                    res.status(400).send({
                        message: "error",
                        error: "Λάθος ποσό!"
                    })
                }
            }
        }
      });
})

// [POST METHOD],[PARAMETERS] => ID, AMOUNT (in request's body section)
// [RESPONSE] => MESSAGE("ERROR" OR "SUCCESS"), DATA(BALANCE)
// Deposits a given amount to a given user
router.post('/deposit', (req, res) => {
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
                        res.json({
                            message: "success",
                            balance: newBalance
                        })
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
})

// Checks if the amount that user's asking to withdraw can be given in 20 and 50 euro bills
function canBeDivided(amount){

    // Return only 20 euro bills
    if(amount%20==0){
        return true;
    }

    // Return 20 euro bills ,50 euro bills or both 
    temp = amount%50;
    
    if(temp%20==0){
        return true;
    }
    
    // In any other case the transaction can't be made
    return false;
}

// This method checks if daily limit need to be reseted.
// Used only in withdraw transactions. 
function resetDailyLimit(id,userDate){
    var sql = "select date from atm where id = ?"
    var params = [id]
    db.get(sql, params, (err, row) => {
        if (err) {
            // If db get won't work inform client
            res.status(400).json({"error":err.message});
            return;
        }
        else{
            // If date of last transaction is different than today's date
            // then limit needs to be reseted.
            date = new Date();
            today = (date.getDate()) + "/" + date.getMonth() + "/" + date.getFullYear();
            if(userDate !== today){
                db.run(
                    `UPDATE atm set 
                    daily_limit = COALESCE(?,daily_limit)
                    WHERE id = ?`,
                    [0, id],
                    function (err, result) {
                        if (err){
                            console.log(err);
                            console.log("Unexpected Error");
                        }
                        else{
                            console.log("Limit reseted for user " + id)
                        }
                    });
            }
        }
    });
}

// Checks if the new balance is positive 
function isNewBalancePositive(balance, amount){
    return balance - amount >=0;
}

function isLimitReached(limit, amount){
    return limit + amount <=2000;
}

module.exports = router;