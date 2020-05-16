const Product = require('../models/product');
const Orders = require('../models/orders');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const stripe = require('stripe')(process.env.STRIPE_KEY);


exports.getproducts = (req ,res , next ) =>{
     Product.find()
     .then(products => {
         console.log(products);
         res.render('home' , {
         pagetitle: 'Products' ,
         path: '/home',
         prods: products,
         isauth: req.session.isloggedin
     }); 
    })
    .catch(err =>{
        console.log(err);
    });
};

exports.getdetails = (req ,res ,next) =>{
    const productid = req.params.productid;
  Product.findById(productid)
  .then(product => {
      res.render('details' , {
          pagetitle: 'Product Details',
          product : product,
          isauth : req.session.isloggedin,
          path : '/details'
      })
  })
  .catch(err =>{
    console.log(err);
})
};

exports.getcart = (req, res, next) => {
    const prodId = req.params.productid;
    Product.findById(prodId)
      .then(product => {
        return req.user.addToCart(product);
      })
      .then(result => {
        console.log(result);
        res.redirect('/');
      })
      .catch(err =>{
          console.log(err);
      });
  };

  exports.displaycart = (req ,res , next) =>{
            req.user.populate('cart.items.productId')
            .execPopulate()
            .then(user=>{
                console.log(user.cart.items)
                products = user.cart.items;
                res.render('cart' , {
                    path: '/cart',
                    pagetitle : 'CART',
                    products : products ,
                    isauth : req.session.isloggedin
                });
            })
            .catch(err =>{
                console.log(err);
            })
  };
  exports.getcheckout = (req ,res , next) =>{
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      let total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });
      res.render('checkout', {
        path: '/checkout',
        pagetitle: 'Checkout',
        products: products,
        totalSum: total,
        isauth : req.session.isloggedin

      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

  exports.removecartitems = (req ,res, next) =>{
    const prodid = req.params.productid;
    console.log(prodid);
    req.user.deletecartitems(prodid)
    .then(result =>{
        res.redirect('/cart');
    })
    .catch(err =>{
        console.log(err);
    })

  };

  exports.postorders = (req , res , next) =>{

    const token = req.body.stripeToken; // Using Express
    let totalSum = 0;
  
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {

      user.cart.items.forEach(p => {
        totalSum += p.quantity * p.productId.price;
      });

      const products = user.cart.items.map(i => {
        return { product: { ...i.productId._doc } };
      });
      console.log(products);
      const order = new Orders ({
        products :  products,
        user : {
            name : req.user.name,
            userid : req.user
        }
    });
    return order.save();
  })
    .then(result =>{
      result.deleteitems();
      req.user.clearcart();
      const charge = stripe.charges.create({
        amount: totalSum * 100,
        currency: 'inr',
        description: 'Demo Order',
        source: token,
        metadata: { order_id: result._id.toString() }
      });
      var customer = stripe.customers.create({
        name: result.user.name
      })
      console.log(result);
      res.redirect('/orderspage');
    })
.catch(err =>{
  console.log(err);
})
  };

  exports.getorderspage = (req , res , next) =>{
    Orders.find({ 'user.userid': req.user._id })
    .then(orders => {
      res.render('orders', {
        path: '/orders',
        pagetitle: 'Your Orders',
        orders: orders ,
        isauth : req.session.isloggedin
      });
    })
    .catch(err => console.log(err));
};

exports.getinvoice = (req , res , next) =>{
  const orderid = req.params.orderid;
  console.log(orderid);
  Orders.findById(orderid)
    .then(order => {
      if (!order) {
        return res.redirect('/orderspage');
      }
      if (order.user.userid.toString() !== req.user._id.toString()) {
        res.status(422).redirect('/orderspage');
      }
      const invoiceName = 'invoice-' + orderid + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);


      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice+= prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title
          );
          pdfDoc.text('-------------');
          pdfDoc
          .fontSize(14)
          .text( 'ACCOUNT COMPLETE GAMES' + '   '+
            prod.product.description
          );
          pdfDoc.text('-------------');
          pdfDoc
          .fontSize(14)
          .text('STEAM ID' + '   '+
            prod.product.steamId
          );
          pdfDoc
          .fontSize(14)
          .text('STEAM PASSWORD' + '   '+
            prod.product.steampassword
          );
          pdfDoc.text('-------------');
      });
      pdfDoc.text('-----------------------');
      pdfDoc.fontSize(20).text('Total Price: RS ' + totalPrice);


      pdfDoc.text('-----------------------');

      pdfDoc.fontSize(20).text('FOR ANY DETAILS CONTACT - +91-7898832267');

      pdfDoc.text('-----------------------');

      
      pdfDoc.end();
    })
  }

