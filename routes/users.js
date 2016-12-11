var express = require('express');
var bodyparser = require('body-parser');
var status = require('http-status');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var deepcopy = require("deepcopy");
var key = require('../config/index')
module.exports = function(wagner) {
    var api = express.Router();
    api.use(bodyparser.json());
    api.use(bodyparser.urlencoded({
        extended: true
    }));
  




 /*
     ****************************************************************
     * validate token when load page                                *
     *                                                              *
     ****************************************************************
     */
    api.post('/validate/token', wagner.invoke(function(User) {
        return function(req, res) {
            var token = req.body.token;
            if (token) {
                jwt.verify(token, key.secret, {
                    algorithms: 'HS256'
                }, function(err, decoded) {
                    if (err) {
                        console.log(err + "\n");
                        return res.status(status.UNAUTHORIZED).json({
                            success: false,
                            message: 'You have not logged in.Please Login first.in validate'
                        });
                    }
                    User.findOne({'profile.phone': decoded.phone})
                      .populate('data.orderhistory')
                      .exec(function (err, user) {
                            if (err) console.log(err);
                    return res.json({
                                    user: user
                                        });
                                              });
                                 }); 
              }
            else {
                // if there is no token
                // return an error
                return res.status(status.UNAUTHORIZED).send({
                    success: false,
                    message: 'Forbidden!No token provided.'
                });
            }

        };
    }));


    /*
     ***************************************************************************
     *  login route handler, use passport middleware to  check if              *
     *  provided phone    and pwd arevalid,                                    *
     *  return coresponding error message if any error,                        *
     *  return jwt token and redirect to the original page.                    *
     ***************************************************************************
     */
    api.post('/login', wagner.invoke(function(User) {
        return function(req, res) {
            passport.authenticate('local', function(err, user, info) {
                var token;

                // If Passport throws/catches an error
                if (err) {
                    res.status(404).json({
                        err: err
                    });
                    console.log(err);
                }

                // If a user is found
                else if (user) {
                    var token = jwt.sign({
                            phone: user.profile.phone
                        },
                        key.secret, {
                            algorithm: 'HS256',
                            expiresIn: 14400
                        });
                    //populate cart

                                res.status(200);
                                res.json({
                                    welcome: 'Good Job',
                                    user: user,
                                    token: token
                                });
              

                } else {
                    // If user is not found
                    res.status(401).json({
                        err: info
                    });
                }
            })(req, res);

        };
    }));
    /*
     ****************************************************************
     *  register route handler,  make a new user object, set hashed *
     *  password , save in the database, and retuen a jwt token.    *
     ****************************************************************
     */
    api.post('/register', wagner.invoke(function(User) {
        return function(req, res) {
            var user = new User();
            user.profile.phone = req.body.phone;
            if (!req.body.phone || !req.body.password) {
                res.status(status.NOT_FOUND).json({
                    "err": "not valid! "
                });
            } else {
                user.setPassword(req.body.password);
                user.save(function(err) {
                    if (err) {
                        res.status(status.NOT_FOUND).json({
                            "err": err
                        });
                    }

                    var token = jwt.sign({
                            phone: user.profile.phone
                        },
                        key.secret, {
                            algorithm: 'HS256',
                            expiresIn: 14400
                        });

                    res.status(200);
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        user: user,
                        token: token
                    });

                });
            }
        };
    }));

    /*
     ****************************************************************
     * route middleware to protect authenticate-need routes         *
     * check if token is valid, if so pass to next route,else       *
     * repond a login-needed message.                               *
     ****************************************************************
     */
    api.use(function(req, res, next) {
        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        if (token) {
            console.log(token);
            jwt.verify(token, key.secret, {
                algorithms: 'HS256'
            }, function(err, decoded) {
                if (err) {
                    console.log(err + "\n");
                    return res.status(status.UNAUTHORIZED).json({
                        success: false,
                        message: 'You have not logged in.Please Login first.'
                    });
                }
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            });
        } else {
            // if there is no token
            // return an error
            return res.status(status.UNAUTHORIZED).send({
                success: false,
                message: 'Forbidden!No token provided. in middleware'
            });
        }

    });
    /*
     ****************************************************************
     * update cart,                                                 *   
     *                                                              *
     *  return a err or sucess message                              *
     ****************************************************************
     */
    api.post('/cart/update', wagner.invoke(function(User) {
        return function(req, res) {
            var phone = req.decoded.phone;
            User.findOne({
                'profile.phone': phone
            }, function(err, user) {
                if (err) {
			console.log(err);
                    return res.status(status.INTERNAL_SERVER_ERROR).
                    json({
                        error: err
                    });
                }
                user.data.cart = deepcopy(req.body.cart);
                //save cart
                //console.log(user.data.cart);
                user.save(function(err) {
                    if (err) {
			console.log(err);
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            error: err
                        });
                    }
                    return res.json({
                        success: "success",
                         user: user
                    });

                });
            });
        };
    }));
    /*
     ****************************************************************
     * populate and respond user's cart                             *
     *                                                              *
     ****************************************************************
     */
    api.get('/cart', wagner.invoke(function(User) {
        // get the user from token infomation
        return function(req, res) {
            var phone = req.decoded.phone;
            User.findOne({
                'profile.phone': phone
            }, function(err, user) {
                if (err) {
                    return res.status(status.BAD_REQUEST).
                    json({
                        error: 'No cart specified!'
                    });
                }
                user.populate({
                        path: 'data.cart.product',
                        model: 'Product'
                    },
                    function(err, result) {
                        if (err) {
                            console.log(err);
                        }
                        //console.log(result.data.cart[0].product._id);
                        return res.json({
                            cart: user.data.cart
                        });
                    });
            });
        };
    }));
    /*
     ****************************************************************
     * empty user's cart                                            *
     *                                                              *
     ****************************************************************
     */

    api.delete('/cart', wagner.invoke(function(User) {

        return function(req, res) {
            var phone = req.decoded.phone;
            User.findOne({
                'profile.phone': phone
            }, function(err, user) {
                if (err) {
                    return res.status(status.BAD_REQUEST).
                    json({
                        error: 'No cart specified!'
                    });
                }
                // empty the user's cart
                user.data.cart.splice(0, user.data.cart.length);
                user.save(function(err) {
                    if (err) {
                        console.log(err);
                    }
                    return res.status(status.OK).
                    json({
                        status: 'cart emptified!',
                        cart: user.data.cart
                    });
                });

            });
        };
    }));
       /*
     ****************************************************************
     * validatepwd user's password                                       *
     *                                                              *
     ****************************************************************
     */
    api.post('/validatepwd', wagner.invoke(function(User) {
        return function(req, res) {
            var phone = req.decoded.phone;
            User.findOne({
                'profile.phone': phone
            }, function(err, user) {
                if (err) {
                    return res.status(status.INTERNAL_SERVER_ERROR).
                    json({
                        error: err,
                        errorType: 'server'
                    });
                }


                if (!user.validPassword(req.body.oldpassword)) {
                    return res.status(status.FORBIDDEN).json({
                        errorType: 'oldpwd',
                        error: 'old password is wrong'
                    });
                }
               return res.status(status.OK).json({
                      success:true
                    });

            });
        };
    })); 
    /*
     ****************************************************************
     * change user's password                                       *
     *                                                              *
     ****************************************************************
     */
    api.post('/changepwd', wagner.invoke(function(User) {
        return function(req, res) {
            var phone = req.decoded.phone;
            User.findOne({
                'profile.phone': phone
            }, function(err, user) {
                if (err) {
                    return res.status(status.INTERNAL_SERVER_ERROR).
                    json({
                        error: err,
                        errorType: 'server'
                    });
                }
                user.setPassword(req.body.password);
                user.save(function(err){

                    if (err) {
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            error: err + ' when save user in changepwd' ,
                            errorType: 'server'
                        });
                    }
                    return res.json({
                        success: true
                    });

                });
            });
        };
    }));
    /*
     ****************************************************************
     * make an order                                                *
     *                                                              *
     ****************************************************************
     */
    api.post('/makeorder', wagner.invoke(function(User, Order,Unsubmittedorder) {
        return function(req, res) {
            var phone = req.decoded.phone;
            User.findOne({
                'profile.phone': phone
            }, function(err, user) {
                if (err) {
                    return res.status(status.INTERNAL_SERVER_ERROR).
                    json({
                        error: err +'when find user in makeorder',
                        errorType: 'server'
                    });
                }
                    console.log(req.body.unsuborder.total);
                var order = new Order({
                  _id: req.body.unsuborder._id,
                  list: req.body.unsuborder.list,
                  address: req.body.unsuborder.address,
                  date: req.body.unsuborder.date,
                  total:parseFloat(req.body.unsuborder.total),
                  shipping:parseInt(req.body.unsuborder.shipping),
                  haspromote:req.body.unsuborder.haspromote,
                  status:'unpaid'
                });
                order.save(function(err) {
                    if (err) {
                        return res.status(status.INTERNAL_SERVER_ERROR).
                        json({
                            error: err + 'when save order',
                            errorType: 'server'
                        });
                    }

                    user.data.orderhistory.push(order);

                    // delete checked product in cart
                    for ( i = 0; i < user.data.cart.length; i++) {
               
                      if (user.data.cart[i].check ) {
                        
                            user.data.cart.splice(i--,1);
                      }
                    }
        
               
                    user.save(function(error) {
                        if (err) {
                            return res.status(status.INTERNAL_SERVER_ERROR).
                            json({
                                error: err + 'when save user',
                                errorType: 'server'
                            });

                        }else{
                          //delete unsuborder
                Unsubmittedorder.remove({ _id: req.body.unsuborder._id },
                       function (err) {
                     if (err){
                       return res.status(status.INTERNAL_SERVER_ERROR).
                        json({
                            error: err + 'when remove unSubmittedOrder ',
                            errorType: 'server'
                        });
                       }
					   
                      return res.status(status.OK).
                        json({
							  success: true,
							  order:order
						   });
                       
                   });
                }
                      
                        });
                    
                    });

                });

        
        };
    }));
    /*
     ****************************************************************
     * make an unsuborder  when logged in                           *
     *                                                              *
     ****************************************************************
     */
    api.post('/makeunsuborder', wagner.invoke(function(Unsubmittedorder) {
        return function(req, res) {

            var unsuborder = new Unsubmittedorder({
                _id: req.body.unSubmittedOrder.id,
                list: req.body.unSubmittedOrder.list,
                date: req.body.unSubmittedOrder.date,
                total: parseFloat(req.body.unSubmittedOrder.total),
                shipping:parseInt(req.body.unSubmittedOrder.shipping),
                haspromote:req.body.unSubmittedOrder.haspromote,
                status: 'starting'
            });
            unsuborder.save(function(err) {
                if (err) {
                    console.log(err);

                    return res.status(status.INTERNAL_SERVER_ERROR).
                    json({
                        error: err + 'when save order in makeunsuborder',
                        errorType: 'server'
                    });
                } else {
                    return res.
                    json({
                        success: true,
                        unsuborderId: unsuborder._id
                    });
                }

            });

        };
    }));


    /*
     ****************************************************************
     * delete addr user profile                                     *
     *                                                              *
     ****************************************************************
     */
 api.post('/deleteaddr', wagner.invoke(function(User) {
        return function(req, res) {           

           
                            //update user add
                            var phone = req.decoded.phone;
                            User.findOne({
                                'profile.phone': phone
                            }, function(err, user) {
                                if (err) {
                        return res.status(status.INTERNAL_SERVER_ERROR).
                            json({
                                error: err + 'when find user in deleteaddr',
                                errorType: 'server'
                            });
                                } else{
                                    
                                    //delete addr at specific index

                      user.profile.addresses.splice(parseInt(req.body.index),
                                1);                                 
                        user.save(function(err) {
                                        if (err) {
                         return res.status(status.INTERNAL_SERVER_ERROR).
                            json({
                                error: err + 'when save user in deleteaddr',
                                errorType: 'server'
                            });
                                    } else {  
                                            return res.
                                            json({
                                                success: true                                      
                                            });
                                        }
                                    });
                                }
                            });
                        
                    };

    }));
    /*
     ****************************************************************
     * save new address user profile                                *
     *                                                              *
     ****************************************************************
     */
 api.post('/saveaddr', wagner.invoke(function(User) {
        return function(req, res) {           
                            //update user add
                            var phone = req.decoded.phone;
                            User.findOne({
                                'profile.phone': phone
                            }, function(err, user) {
                                if (err) {
                        return res.status(status.INTERNAL_SERVER_ERROR).
                            json({
                                error: err + 'when find user in saveaddr',
                                errorType: 'server'
                            });
                                } else {    
                            if (req.body.index==(-1)) {
                                        // new addr
                                user.profile.addresses.push(req.body.address);
                                    }
                                 else{
                                    //update addr at specific index

                      user.profile.addresses.splice(parseInt(req.body.index),
                                1);
                              user.profile.addresses.push(req.body.address);
                                     
                               
                                 }
                                    user.save(function(err) {
                                        if (err) {
                         return res.status(status.INTERNAL_SERVER_ERROR).
                            json({
                                error: err + 'when save user in saveaddr',
                                errorType: 'server'
                            });
                                        } else {
                                           
                                            return res.
                                            json({
                                                success: true
                                            });
                                        }
                                    });
                                }
                            });
                        
                    };

    }));
    return api;
};
