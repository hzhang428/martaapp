var getConnection = require('./db.js');
var mySQL = require('mysql');

function getCardByParameters(cardNumber, lower, higher, owner, showConflict) {
    // console.log(cardNumber);
    // console.log(lower);
    // console.log(higher);
    // console.log(owner);
    // console.log(showConflict);
    var sql;
    if (showConflict === 'true') {
        sql = "SELECT " + 
                "* " + 
                "FROM " + 
                "BreezeCard";
        if (!cardNumber && !lower && !higher && !owner) {
            return sql;
        }
        sql += " WHERE";
        if (cardNumber) {
            sql += " CardNumber = ?";
            sql = mySQL.format(sql, cardNumber);
            if (valueRange || owner) {
                sql += " AND";
            } else {
                return sql;
            }
        }
        if (lower || higher) {
            if (lower && higher) {
                sql += " Value >= ? AND Value <= ?";
                sql = mySQL.format(sql, [lower, higher]);
            } else if (lower) {
                sql += " Value >= ?";
                sql = mySQL.format(sql, lower);
            } else {
                sql += " Value <= ?";
                sql = mySQL.format(sql, higher);
            }
            if (owner) {
                sql += " AND";
            } else {
                return sql;
            }
        }
        if (owner) {
            sql += " BelongsTo = ?";
            sql = mySQL.format(sql, owner);
        }
        return sql;
    } else {
        sql = "SELECT " + 
                "A.CardNumber, A.Value, A.BelongsTo " + 
                "FROM " + 
                "BreezeCard AS A " + 
                "WHERE";
        if (cardNumber) {
            sql += " A.CardNumber = ? AND";
            sql = mySQL.format(sql, cardNumber);
        }
        if (lower || higher) {
            if (lower && higher) {
                sql += " A.Value >= ? AND A.Value <= ? AND";
                sql = mySQL.format(sql, [lower, higher]);
            } else if (lower) {
                sql += " A.Value >= ? AND";
                sql = mySQL.format(sql, lower);
            } else {
                sql += " A.Value <= ? AND";
                sql = mySQL.format(sql, higher);                
            }

        }
        if (owner) {
            sql += " A.BelongsTo = ? AND";
            sql = mySQL.format(sql, owner);
        }
        sql += " A.CardNumber " + 
                "NOT IN " + 
                "(SELECT B.CardNumber FROM Conflict AS B)";
        return sql;
    } 
}

module.exports = {
    find: function(params, callback) {
        var showConflict = params.showconflict;
        var lower = +params.lower;
        var higher = +params.higher;
        var cardNumber = params.cardnumber;
        var owner = params.owner;

        getConnection(function(err, con) {
            if (err) {
                callback(err, null);
            } else {
                var sql = getCardByParameters(cardNumber, lower, higher, owner, showConflict);
                // console.log(sql);
                con.query(sql, function(err, BreezeCards) {
                    callback(null, BreezeCards);
                    con.release();
                });
            }
        });
    },
}