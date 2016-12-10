


var mongoose = require('mongoose');
var sprintf = require("sprintf-js").sprintf;
module.exports = function(wagner) {

var host1 = "dds-bp1b3f2f84c2e1642.mongodb.rds.aliyuncs.com:3717";
var port1 = 27017;


var username = "admin";
var password = "admin";
var replSetName = "mgset-1095113";
var demoDb = "web";



  
  mongoose.connect("mongodb://localhost/test");

  var Category =
    mongoose.model('Category', require('./category'), 'categories');

  var Comment =
    mongoose.model('Comment', require('./comment'), 'comments');
 
var Product =
    mongoose.model('Product', require('./product'), 'products');
 
 var Order =
    mongoose.model('Order', require('./order'), 'orders');

  var Unsubmittedorder =
    mongoose.model('Unsubmittedorder', require('./unsubmittedorder'), 'unsubmittedorders');
      
  var User =
    mongoose.model('User', require('./user'), 'users');
    
  wagner.factory('Category', function() {
    return Category;
  });
    wagner.factory('Product', function() {
    return Product;
  });
    wagner.factory('User', function() {
    return User;
  });
    wagner.factory('Order', function() {
    return Order;
  });
    wagner.factory('Unsubmittedorder', function() {
    return Unsubmittedorder;
  });
   wagner.factory('Comment', function() {
    return Comment;
  });
 
 var models = {
    Category: Category,
    Product: Product,
    User: User,
    Order:Order,
    Unsubmittedorder:Unsubmittedorder,
     Comment:Comment 
 };
  return models;
};

