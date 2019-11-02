const express = require('express');
const router = express.Router();
const db = require('../../database')

// give id
router.get('/balance', (req, res) => {

    var sql = "select balance from atm where id = ?"
    var params = [req.headers.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        if(row === undefined){
            res.json({
                "message":"error",
                "error":("No user with id " + req.headers.id)
            })
        }
        else{
            if(row.date)
            res.json({
                "message":"success",
                "data":row
            })
        }
      });

});

// give id and money
router.post('/withdraw', (req, res) => {
    var sql = "select * from atm where id = ?"
    var params = [req.body.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        else{
            if(row.balance - parseInt(req.body.amount) >=0 && row.daily_limit + parseInt(req.body.amount) <=2000){
                if(canBeDivided(req.body.amount)){
                newBalance = row.balance - req.body.amount;
                newDailyLimit = parseInt(row.daily_limit) + parseInt(req.body.amount);
                date = new Date();
                console.log(date);
                db.run(
                    `UPDATE atm set 
                    balance = COALESCE(?,balance),
                    daily_limit = COALESCE(?,daily_limit),
                    date = COALESCE(?,date)
                    WHERE id = ?`,
                    [newBalance, newDailyLimit, date, req.body.id],
                    function (err, result) {
                        if (err){
                            res.status(400).json({"error": res.message})
                            return;
                        }
                        res.json({
                            message: "success",
                            data: newBalance,
                            changes: this.changes
                        })
                });
                }
                else{
                    res.status(400).send({
                        message: "error",
                        error: "Λάθος ποσό!"
                    })
                }
            }
            else {
                res.status(400).send({
                    message: "error",
                    error: "Λάθος ποσό!"
                })
            }
        }
      });
})

// give id and money
router.post('/deposit', (req, res) => {
    var sql = "select * from atm where id = ?"
    var params = [req.body.id]
    db.get(sql, params, (err, row) => {
        if (err) {
        res.status(400).json({"error":err.message});
        return;
        }
        else{
            if(parseInt(req.body.amount)%5 == 0){
            newBalance = parseInt(row.balance) + parseInt(req.body.amount);
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
                        data: newBalance,
                        changes: this.changes
                    })
                });
            }
            else{
                res.status(400).send({
                    message: "error",
                    error: "Λάθος ποσό! Το ποσό κατάθεσης πρέπει να είναι πολλαπλάσιο του 5."
                })
            }
        }
    });
})

function canBeDivided(amount){

    if(amount%20==0){
        return true;
    }

    temp = amount%50;
    
    if(temp%20==0){
        return true;
    }
    
    return false;
}

function getDate(){

    // today date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = dd + '/' + mm + '/' + yyyy;
    
    return today;
}


module.exports = router;