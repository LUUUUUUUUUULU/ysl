var express = require('express');
var status = require('http-status');
var deepcopy = require("deepcopy");
module.exports = function(wagner) {
  var api = express.Router();
/*
***************************************************************************
*  get all products                                                       *                 *
***************************************************************************
*/
  api.get('/',wagner.invoke(function(Product){
      return function(req,res){
         Product.find({},function(error,products){
                    if (error) {
                        return res.
                        status(status.INTERNAL_SERVER_ERROR).
                        json({ error: error.toString() });
                    }else{
                  res.status(status.OK).
                  json({ products: products });
                    }
         });
      };
  }));
/*
***************************************************************************
* get the product via product id                                          *
***************************************************************************
*/
  api.get('/id/:id', wagner.invoke(function(Product) {
    return function(req, res) {
      Product.findOne({ _id: req.params.id }, function(error, product) {
        if (error) {
          return res.
            status(status.INTERNAL_SERVER_ERROR).
            json({ error: error.toString() });
        }
        if (!product) {
          return res.
            status(status.NOT_FOUND).
            json({ error: 'Not found' });
        }

        res.json({ product: product });
      });
    };
  }));
  /*
****************************************************************
* add a sale quantity to a product                             *
*                                                              *
****************************************************************
*/
 api.post('/addsaleamount/:product_id',wagner.invoke(function(Product){
        return function(req,res){
          if (!req.body.quantity) {
               return res.status(status.BAD_REQUEST).
                     json({error:"Bad Request! No quantity!"});
          }
             Product.findOne({_id:parseInt(req.params.product_id)},
                function(err,product) {
                   if (err) {
                    return res.status(status.INTERNAL_SERVER_ERROR).
                     json({error:err +" when load product in addsaleamount!"});
                   }else{
                 
                   product.sales+=parseInt(req.body.quantity);
                      product.save(function(err){
                       if (err) {
                    return res.status(status.INTERNAL_SERVER_ERROR).
                     json({error:err +" when save product in addsaleamount!"});
                   }
                    return res.status(status.OK).
                     json({success:"successful added sales addsaleamount!"});
                    });
                  
                   }

             });      
        };
}));
/*
****************************************************************
* add a comment to a product                                   *
*                                                              *
****************************************************************
*/
 api.post('/comment/:product_id',wagner.invoke(function(Product){
        return function(req,res){
          if (!req.body.comment) {
               return res.status(status.BAD_REQUEST).
                     json({error:"Bad Request! Not comment!"});
          }
             Product.findOne({_id:parseInt(req.params.product_id)},
                function(err,product) {
                   if (err) {
                    return res.status(status.INTERNAL_SERVER_ERROR).
                     json({error:err +" when load product!"});
                   }else{
                    //console.log(req.body.comment);
                    product.comments.push(deepcopy(req.body.comment));
                    product.save(function(err){
                       if (err) {
                    return res.status(status.INTERNAL_SERVER_ERROR).
                     json({error:err +" when save comment!"});
                   }
                    return res.status(status.OK).
                     json({success:"successful added comment!"});
                    });
                  
                   }

             });      
        };
}));
/*
****************************************************************
* get products via ancestor                                    *
*                                                              *
****************************************************************
*/
api.get('/ancestor/:id', wagner.invoke(function(Product) {
    var sort;
    return function(req, res) {
      if (req.query.price==="1") {  sort = {price:1};}
        else {
          sort = { name: 1 };
        }
      Product.
        find({'category.ancestors':req.params.id}).
        sort(sort).
        exec(function(error, products) {
          if (error) {
            return res.
              status(status.INTERNAL_SERVER_ERROR).
              json({ error: error.toString() });
          }
          res.json({ products:products });
        });
    };
  }));
/*
****************************************************************
* get products via category                                    *
*                                                              *
****************************************************************
*/
  api.get('/category/:id', wagner.invoke(function(Product) {
    var sort;
    return function(req, res) {
      if (req.query.price==="1") {  sort = {price:1};}
        else {
          sort = { name: 1 };
        }
      Product.
        find({'category._id':req.params.id}).
        sort(sort).
        exec(function(error, products) {
          if (error) {
            return res.
              status(status.INTERNAL_SERVER_ERROR).
              json({ error: error.toString() });
          }
          res.json({ products:products });
        });
    };
  }));

  return api;
};
