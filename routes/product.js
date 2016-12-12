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
