const express = require('express');

const router = express.Router();

const shopcontroller = require('../controllers/shop');
const isAuth = require('../middleware/is_auth');

router.get('/' , shopcontroller.getproducts);

router.get('/product/:productid' , shopcontroller.getdetails);

router.get('/cart/:productid' , isAuth, shopcontroller.getcart);

router.get('/cart' ,  isAuth,  shopcontroller.displaycart);

router.get('/delete/:productid' ,  isAuth,  shopcontroller.removecartitems);

router.get('/checkout' ,  isAuth,  shopcontroller.getcheckout);

router.post('/orders' ,  isAuth,  shopcontroller.postorders);

router.get('/orderspage' ,  isAuth,  shopcontroller.getorderspage);

router.get('/orders/:orderid' ,  isAuth,  shopcontroller.getinvoice);


module.exports = router;