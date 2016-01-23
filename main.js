/*
main.js is responsible for the routing of the calls and also
to provide the user with the GUI

Abhishek Dewan
*/

var express = require('express'),
    bodyparser = require('body-parser')
    format = require('string-format')
    http = require('http-server')
    scrapper = require('./scapper.js'),
    ip = require('ip');

var app = express();

//STATIC VARIABLES

var PORT_NO = 10000;
var FILESHARE_PORTNO = 8080;

//setup body parsing on the server
http.createServer({
  root: 'files/',
  cors: true,
}).listen(FILESHARE_PORTNO);

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.set('view engine','jade');
app.set('views',__dirname+'/views');

app.listen(PORT_NO,function(){
  console.log(format('MIL Amazon Scrapper is live on port number : {}',PORT_NO))
});

//setup sharing the files folder


//routes

app.get("/",function(req,res){
  res.sendFile('index.html',{root:'./views/'});
});

app.post("/submit",function(req,res){
  console.log(req.body.ASIN+" - "+req.body.FILENAME+" - "+req.body.PAGES+" - "+req.body.TYPE+" - "+req.body.STARFILTER);
  //Do something with the data you've just gotten
  res.redirect('/status');
});


app.get("/status",function(req,res){
  var complete = 100;
  if(complete < 100){
    res.render('status.jade',{percentage:complete+"%",localhost:ip.address()});
  }
  if(complete==100) {
    res.redirect('http://'+ip.address()+':8080/')
  }
});
