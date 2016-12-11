var express = require('express');
var status = require('http-status');

module.exports = function(wagner) {
  var api = express.Router();

//get orders via store id  and timestamp
  api.get('/orders/:id', wagner.invoke(function(Order) {
    return function(req, res) {
      Order.find({ 'product.store._id': req.params.id }, function(error,orders ) {
        if (error) {
          return res.
            status(status.INTERNAL_SERVER_ERROR).
            json({ error: error.toString() });
        }
        if (!orders) {
          return res.
            json({ error: 'Not orders' });
        }
        res.json({ orders: orders });
      });
    };
  }));

  return api;
};
