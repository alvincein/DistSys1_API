const express = require('express');
const router = express.Router();
const db = require('../../database')


    // Get single member by id
    router.get('/:id', (req, res) => {
    var sql = "select * from atm where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        if(row === undefined){
            res.json({
                "message":"error",
                "error":("No user with id " + req.params.id)
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

    // Get all members
    router.get('/' , (req, res, next) => {
        var sql = "select * from atm"
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
              res.status(400).json({"error":err.message});
              return;
            }
            res.json({
                "message":"success",
                "data":rows
            })
          });
    });

    // Create Member
    router.post('/', (req, res) => {
        var errors=[]
        if (!req.body.surname){
            errors.push("No surname specified");
        }
        if (errors.length){
            res.status(400).json({"error":errors.join(",")});
            return;
        }
        var data = {
            name: req.body.name,
            surname: req.body.surname,
            balance: 0,
            daily_limit: 0
        }
        var sql ='INSERT INTO atm (name, surname, balance, daily_limit) VALUES (?,?,?,?)'
        var params =[data.name, data.surname, data.balance, data.daily_limit]
        db.run(sql, params, function (err, result) {
            if (err){
                res.status(400).json({"error": err.message})
                return;
            }
            res.json({
                "message": "success",
                "data": data,
                "id" : this.lastID
            })
        });
    });

module.exports = router;
