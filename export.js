/**
 * Created by naluyang on 16/12/12.
 */
var json2xls = require('json2xls');
var fs = require('fs');
var mysql = require('mysql');
function getConnection(){
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'admin',
        port     :3306,
        database : 'crawler',
        multipleStatements: true
    });
    return connection;
}
function doSql(sql){
    var connection = getConnection();
    try{
        connection.connect(function(err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('connected as id ' + connection.threadId);
        });
        connection.query(sql, [],function(err, rows, fields) {
            if (err){
                console.log('sql err',err);
                connection.end();
                return ;
            }else{
                console.log(rows);
                connection.end();
                var xls = json2xls(rows);
                fs.writeFileSync('data.xlsx', xls, 'binary');
            }
        });
    }catch(err){
        connection.end();
    }finally{
        //connection.end();
        return ;
    }
}
doSql("SELECT * FROM crawler.crawler4S;");


//var json = [{
//    foo: 'bar',
//    qux: 'moo',
//    poo: 123,
//    stux: new Date()
//},
//{
//    foo: 'bar',
//    qux: 'moo',
//    poo: 345,
//    stux: new Date()
//}];
//
//var xls = json2xls(json);
//
//fs.writeFileSync('data.xlsx', xls, 'binary');