
const db = require('../../database')

// EXTRAS
// We import these extra functions in rpc.js
// They are in a separate file for better code structure purposes

module.exports = {

    // This method checks if daily limit need to be reseted.
    // Used only in withdraw transactions. 
    resetDailyLimit: function (id,userDate){
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
                            return;
                        });
                }
            }
        });
    },


    // Checks if the amount that user's asking to withdraw can be given in 20 and 50 euro bills
    canBeDivided: function (amount){

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
    },

    // Checks if the new balance is positive 
    isNewBalancePositive: function (balance, amount){
        return balance - amount >=0;
    },

    isLimitReached: function (limit, amount){
        return limit + amount <=2000;
    }

}