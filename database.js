var sqlite3 = require('sqlite3').verbose()
var md5 = require('md5')

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE atm (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          surname TEXT NOT NULL,
          balance INTEGER,
          daily_limit INTEGER,
          date TEXT
      );`,
        (err) => {
            if (err) {
                // ERR
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO atm (name, surname, balance, limit, date) VALUES (?,?,?,?,?)'
                db.run(insert, ["Γιώργος","Καραγιάννης",2000,0,null])
                db.run(insert, ["Μήτσος","Μπάρμπας",1000,0,null])
            }
        });  
    }
});


module.exports = db;