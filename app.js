var superagent = require("superagent"),
    cheerio = require("cheerio"),
    mysql = require('mysql'),
    async = require("async"),
    curCount = 0,
    sql = "INSERT INTO crawler.crawler4S VALUES (NULL,?,?),(NULL,?,?),(NULL,?,?),(NULL,?,?),(NULL,?,?),(NULL,?,?),(NULL,?,?),(NULL,?,?),(NULL,?,?),(NULL,?,?);"
    logger = require('./logger');
logger.setLevel('INFO');
logger.info('4s crawler start');
var pageNum = 2759,
    urls = [];
for(var i=1;i<pageNum;i++){
    urls.push("http://www.chewen.com/dealer/0-0-0-0-0-0-"+i+"-0-0-0-0");
}
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
function doSql(arr){
    var connection = getConnection();
    try{
        connection.connect(function(err) {
            if (err) {
                //emailServer.mailOptions.html = '打开数据连接出错---------'+JSON.stringify(err)+'---------------'+err.toLocaleString();
                //emailServer.sendEmail();
                logger.info('error connecting: ' + err.stack);
                return;
            }
            logger.info('connected as id ' + connection.threadId);
        });
        connection.query(sql, arr,function(err, rows, fields) {
            if (err){
                logger.info('sql err',err);
                connection.end();
                logger.info('插入数据出错');
                //emailServer.mailOptions.html = '插入数据出错---------'+JSON.stringify(err)+'---------------'+err.toLocaleString();
                //emailServer.sendEmail();
                return ;
            }else{
                connection.end();
                logger.info('更新sucess');
            }
        });
    }catch(err){
        logger.info('catch ' + connection.threadId);
    }finally{
        return ;
    }
}
var reptileMove = function(url,callback){
    var delay = parseInt(((Math.random()+005) * 30000000) % 5000, 10);
    curCount++;
    logger.info('现在的并发数是', curCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');
    superagent.get(url)
        .end(function(err,sres){
            if (err) {
                logger.info(err);
                return;
            }
            //读取流构造伪dom树
            var $ = cheerio.load(sres.text);
            var $arr = $(".jxs_tita_wbox .jxs_dlabox");
            var resultArr = [];
            $arr.each(function(index,item){
                resultArr.push($arr.eq(index).find("dt").text());
                resultArr.push($arr.eq(index).find("dd em").text());
            });
            logger.info(resultArr);
            doSql(resultArr)
        });
    setTimeout(function() {
        curCount--;
        callback(null,url +'Call back content');
    }, delay);
};
async.mapLimit(urls, 3 ,function (url, callback) {
    logger.info(url);
    reptileMove(url, callback);
}, function (err,result) {
    if(err){
        logger.info(err);
    }
});
