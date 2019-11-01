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
            if(row.balance >=20){
                newBalance = row.balance - req.body.amount;
                console.log(newBalance);
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
                newBalance = parseInt(row.balance) + parseInt(req.body.amount);
                console.log(newBalance);
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
    });
})

function canBeDivided (amount){

    if(amount%20==0){
        return true;
    }

    temp = amount%50;
    
    if(temp%20==0){
        return true;
    }
    else {
        if(temp%10==0){
            return true;
        }
        else {return false;}
        
    }
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