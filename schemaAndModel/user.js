var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var key =require('../config/index');
var Order = require('./order');
var Product = require('./product');
var userSchema = {
 	profile:{
        username:{
        type:String,
        lowercase:true
        },
    email:{
 		type:String,
 		match:/.+@.+\..+/,
 		lowercase:true
 	},
    phone:{
    type:Number,
    required:true
  },
 	    hash: String,
      salt: String,

      picture:{
        	type:String,
          match:/^http:\/\//i
        },
      addresses:[{
        selectedProvice:String,
        selectedCity:String,
        selectedArea:String,
        recipient:String,
        address:String,
        phone:String
      }]
 	},

 		data: {
       oauth: { type: String },
 		   cart: [{
     	 product:Product.productSchema,
        quantity: {
           type: Number,
           min: 1
      },
      check:{
         type:Boolean
      }
    }],
    orderhistory:[ { 
            type:String ,
            ref:'Order'
                    }]
 	}
 };


module.exports = new mongoose.Schema(userSchema);
module.exports.methods.setPassword = function(password){
  this.profile.salt = crypto.randomBytes(16).toString('hex');
  this.profile.hash = crypto.pbkdf2Sync(password, this.profile.salt, 1000, 64).toString('hex');
};
module.exports.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.profile.salt, 1000, 64).toString('hex');
  return this.profile.hash === hash;
};
module.exports.userSchema = userSchema;