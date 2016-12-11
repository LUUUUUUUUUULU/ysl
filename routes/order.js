var express = require('express');
var status = require('http-status');
var deepcopy = require("deepcopy");
module.exports = function(wagner) {
  var api = express.Router();

/*
***************************************************************************
* get the product via product id                                          *
***************************************************************************
*/
  api.get('/id/:id', wagner.invoke(function(Order) {
    return function(req, res) {
      Order.findOne({ _id: req.params.id }, function(error, order) {
        if (error) {
          return res.
            status(status.INTERNAL_SERVER_ERROR).
            json({ error: error.toString() });
        }
        if (!order) {
          return res.
            status(status.NOT_FOUND).
            json({ error: 'Not found' });
        }

        res.json({ order: order });
      });
    };
  }));




  return api;
};
