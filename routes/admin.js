const express = require('express');
const path = require('path');

const admincontroller = require('../controllers/admin');
const isAuth = require('../middleware/is_auth');

const router = express.Router();

router.get('/add-products' , isAuth , admincontroller.getaddProduct);

router.post('/add-products', isAuth , admincontroller.postaddProduct );

router.get('/admin-products' , isAuth , admincontroller.getadminproducts);

router.get('/edit-product/:productid' , isAuth , admincontroller.geteditproduct);

router.get('/delete-product/:productid' , isAuth , admincontroller.getdeleteproduct);

router.post('/edit-product', isAuth , admincontroller.posteditproduct );


module.exports = router; 