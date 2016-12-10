var mongoose = require('mongoose');
var Product = require('./product');
var Schema = mongoose.Schema;
var orderSchema = {
  _id: { 
       type:String ,
       required:true 
    },
 shipping:{ 
       type:Number 
    },
  haspromote:Boolean,
  list:[{
    product:Product.productSchema,
    quantity: {
      type:Number,
      min:1
    }
  }],
  address:{
        selectedProvice:String,
        selectedCity:String,
        selectedArea:String,
        recipient:String,
        address:String,
        phone:String
  },
  date:Schema.Types.Mixed,
  status:String,
  total:Number
};
module.exports = new mongoose.Schema(orderSchema);
module.exports.orderSchema = orderSchema;
