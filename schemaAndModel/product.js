var mongoose = require('mongoose');
var Category = require('./category');
var Schema = mongoose.Schema;
var productSchema = {
  _id: { type:Number},
  name: { type: String, required: true },
  sales:{type:Number},
  oldprice:{type: Number},
  price: {
   type: Number, 
   required: true 
  },
  // Pictures must start with "http://"
  smallpic130:{type: String, match: /^http:\/\//i },
  smallpic210:{type: String, match: /^http:\/\//i },
  detailpictures: [{ type: String, match: /^http:\/\//i }],
  sliderpictures: [{ type: String, match: /^http:\/\//i }],
  //options part
  priceoptions: [{ type: Number}],
  flavoroptions: [{ type: String}],
  selectedflavor:{ type: String},
  sizeoptions: [{ type: String}],
  selectedsize:{ type: String},
  //descrition part
  shortDes:{ type: String},
  detailDes: [{ type: String }],
  flavor:{ type: String},
  expirationDate:{ type: String},
  eatmethod:{ type: String},
  savemethod:{ type: String},
  weight:{ type: String},
  mifang:{ type: String},
  requirement:{ type: String},
  category: Category.categorySchema,
    //promotion part
    /*
  promote:{
  prolist:  [{
   type:Number ,
   ref:'Product'
    }], // products promoted with the product
    method: { type: String} //promote methed ex: fix price
  }, 
  */
  comments: [{ 
            type:Schema.ObjectId ,
            ref:'Comment'
                    }]
};
module.exports = new mongoose.Schema(productSchema);
module.exports.productSchema = productSchema;
