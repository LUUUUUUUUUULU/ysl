var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commentSchema = {
time:{
      type:Schema.Types.Mixed,
      required:true
      },
content:{
      type:String,
      required:true
      },

author:{
  name:{
      type:String,
      required:true
    },
  _id:{ 
       type:mongoose.Schema.Types.ObjectId ,
       required:true 
    }
               },
reply:{
   type:mongoose.Schema.Types.ObjectId ,
   ref:'Comment'
},
rate: {
  type:Number,
   required:true 
}                  
};
module.exports  = new mongoose.Schema(commentSchema);
module.exports.commentSchema = commentSchema;
