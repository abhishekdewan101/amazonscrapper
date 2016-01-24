var Xray = require("x-ray"),
    fs = require('fs'),
    readline= require('readline-sync'),
    format = require('string-format'),
    sleep = require("sleep");


var x = new Xray();

var BASEURL = 'http://www.amazon.com/Apple-iPhone-Silver-16-Unlocked/product-reviews/{}/ref=cm_cr_pr_btm_link_2?ie=UTF8&showViewpoints=2&sortBy=recent&reviewerType=all_reviews&formatType=all_formats&filterByStar=all_stars&pageNumber={}';

var ASIN = "",
    FILENAME="",
    PAGES="",
    TYPE="",
    STARFILTER="";

var percentageComplete = 0;


exports.init = function init(mAsin,mFilename,mPages,mType,mStarFilter){
    ASIN = mAsin;
    FILENAME = format("files/{}/",mFilename) +  mFilename;
    if (!fs.existsSync(format("files/{}/",mFilename))){
    fs.mkdirSync(format("files/{}/",mFilename));
    }
    PAGES = mPages;
    TYPE = mType;
    STARFILTER = mType;
    //Starting Request

    console.log("[SCAPPER.JS] "+ASIN+"-"+FILENAME+"-"+PAGES+"-"+TYPE+"-"+STARFILTER);
    choosefiletype();
}
exports.status = function status(){
  return percentageComplete;
}

function choosefiletype(){
  switch(TYPE){
    case "2": //csv case
      FILENAME = FILENAME + ".csv";
      fs.appendFile(FILENAME,"Title;Author;ReviewText;Star_Rating\n",function(err){if(err!=null){console.log(err)}});
      scrape_loop(FILENAME,BASEURL,PAGES);
      break;

    case "1": //txt case
      if(STARFILTER === "1"){
        FILENAME = FILENAME + "-{}.txt"
        scrape_loop(FILENAME,BASEURL,PAGES);
        break;
      }else{
        FILENAME = FILENAME + ".txt";
        scrape_loop(FILENAME,BASEURL,PAGES);
        break;
      }
  }
}


function scrape_loop(filename,baseurl,pages){
  for(var i =1;i<=parseInt(pages);i++){
      console.log(format("[DEBUG] loop is going through iteration number {}",i));
      var url = format(baseurl,ASIN,i);
      console.log(format("[DEBUG] Scrapping page number {}",i));
      percentageComplete = (i/parseInt(pages))*100
      scrape(url,FILENAME);
      console.log(getRandomDelay());
      sleep.sleep(getRandomDelay());
  }
  console.log(format('[DEBUG] Scrapper done scrapping comments for {}',filename));
}

function getRandomDelay(){
  return Math.floor(Math.random()*(300-120) + 120);
}

function scrape(url,file){
  x(url, '#cm_cr-review_list', [{
    title: x('.a-section .review',['.review-title']),
    author: x('.a-section .review',['.author']),
    reviewtext: x('.a-section .review', ['.review-text']),
    stars: x('.a-section .review', ['.a-icon-alt'])
  }])(function(err, arr) {
    var review = arr[0];
    var titles = review.title;
    var author = review.author;
    var reviewtext = review.reviewtext;
    var stars = review.stars;

    for(var i=0;i<titles.length;i++){
      if(STARFILTER === "1"){
        var data = removespecial(titles[i]) + " --> " + removespecial(author[i])+" --> "+removespecial(reviewtext[i])+"\n";
        writefile(format(file,correctstars(stars[i])),data);
      }else{
        var data = removespecial(titles[i]) + ";" + removespecial(author[i])+";"+removespecial(reviewtext[i])+";"+correctstars(stars[i])+"\n";
        writefile(file,data);
      }
    }
  });
}

function removespecial(text){
  return text.replace(/[^a-zA-Z ]/g, "");
}

function correctstars(stars){
  switch(stars){
    case "5.0 out of 5 stars":
        return 5;
    case "4.0 out of 5 stars":
        return 4;
    case "3.0 out of 5 stars":
        return 3;
    case "2.0 out of 5 stars":
        return 2;
    case "1.0 out of 5 stars":
        return 1;
  }
}

function writefile(filename,data){
  fs.appendFile(filename,data,function(err){
    if(err != null){console.log("[writefile]" + err);}
  });

}
