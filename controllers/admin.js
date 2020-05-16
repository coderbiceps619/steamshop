const express = require('express');
const Product = require('../models/product');
const filehelper = require('../util/filehelper');

exports.getaddProduct = (req ,res , next) =>{
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
      }
      else{
        message = null;
      }
    res.render('addproducts' , {
        pagetitle : 'addproduct',
        path:'/addproduct' ,
        isauth : req.session.isloggedin,
        errormessage : message
    });

    }

    exports.postaddProduct = (req ,res , next) => {
       const title = req.body.title;
       const imgurl = req.file;
       const steamId = req.body.steamId;
       const steampassword = req.body.steampassword;
       const price = req.body.price;
       const description = req.body.description;

       console.log(imgurl);

       if(!imgurl){
           req.flash('error' , 'Please select correct image file');
           res.redirect('/add-products')
       }

       const image = imgurl.path;

          const product = new Product({
                title: title,
                price:price,
                steamId : steamId,
                steampassword : steampassword,
                description : description,
                imgurl : image, 
                userid  : req.user
            });
            product.save()
            .then((_result) => {
                console.log("created product");
                res.redirect('/');
            }).catch((err) => {
                console.log(err);
            });
    };
   
    exports.getadminproducts = (req , res ,next ) =>{
        Product.find({userid : req.user._id})
        .then(products => {
            console.log(products);
            res.render('adminproducts' , {
            pagetitle: 'Admin Products' ,
            path : '/adminproduct',
            prods: products,
            isauth : req.session.isloggedin
        }); 
       })
       .catch(err =>{
           console.log(err);
       }); 
    };

    exports.geteditproduct = (req ,res ,next) =>{
           const prodid = req.params.productid;

        Product.findById(prodid)
        .then(product =>{
            res.render('editproduct' , {
                pagetitle : 'Edit Product' , 
                product : product,
                path:'editproduct',
                isauth : req.session.isloggedin
            })
        })
        .catch(err => {
            console.log(err);
        })
    };

    exports.posteditproduct = (req , res , next) =>{
        const newid = req.body.productid;
        const updatedtitle = req.body.title;
        const image = req.file;
        const updatedsteamId = req.body.steamId;
        const updatedsteampassword = req.body.steampassword;
        const updatedprice = req.body.price;
        const updateddescription = req.body.description;

        Product.findById(newid)
        .then(product =>{
            product.title = updatedtitle;
            if(image){
                filehelper.deleteFile(product.imgurl);
                product.imgurl = image.path;
            }
            product.steamId = updatedsteamId;
            product.steampassword = updatedsteampassword;
            product.description = updateddescription;
            product.price = updatedprice;
            return product.save();
        })
        .then(result =>{
            console.log(result , 'sucessfull');
            res.redirect('/');
        })
        .catch(err =>{
            console.log(err);
        })
    };

    exports.getdeleteproduct = (req, res, next) =>{
        const prodid = req.params.productid;
        Product.findById(prodid)
        .then(product =>{
            filehelper.deleteFile(product.imgurl);
        })
        .catch(err =>{
            console.log(err);
        })
        Product.findByIdAndRemove(prodid)
        .then(() =>{
            
            console.log('product deleted');
            res.redirect('/admin-products');
        })
        .catch(err =>{
            console.log(err);
        })
    };