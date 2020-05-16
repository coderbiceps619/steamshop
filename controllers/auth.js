const User = require('../models/user');
const brcypt = require('bcryptjs');
const crypto = require('crypto');

const nodemailer = require('nodemailer');
const sendgridtransport = require('nodemailer-sendgrid-transport'); 

const {validationResult} = require('express-validator');

const transporter = nodemailer.createTransport(sendgridtransport({
 auth : {
   api_key : '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'
 }
}));

exports.getlogin = (req ,res ,next) =>{
  let message = req.flash('error');
  if(message.length > 0){
    message = message[0];
  }
  else{
    message = null;
  }
    console.log(req.session);
    res.render('login' , {
      pagetitle : 'LOGIN',
      path : '/login',
      isauth : false,
      errormessage : message
    });
  }

  exports.postlogin = (req,res, next) =>{
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email : email})
    .then(user =>{
      if (!user){
        req.flash('error' , 'INVALID EMAIL OR PASSSWORD');
        res.redirect('/login')
      }
      brcypt.compare(password , user.password)
      .then(domatch => {
        if(domatch){
          req.session.user = user;
          req.session.isloggedin = true;
        return req.session.save( err =>{
            console.log(err);
            res.redirect('/');
          }); 
        }
        req.flash('error' , 'INVALID EMAIL OR PASSWORD')
        res.redirect('/login');
      });
    }) 
    .catch(err =>{
      console.log(err);
      res.redirect('/');
    })
  };

  exports.getlogout = (req ,res , next) =>{
    req.session.destroy( () =>{
      res.redirect('/');
    });
  }

  exports.getsignup = (req ,res , next) =>{
    let message = req.flash('error1');
    if(message.length > 0){
      message = message[0];
    }
    else{
      message = null;
    }
  res.render('signup' , {
    pagetitle : 'signup' ,
    path : '/signup',
    isauth : false,
    errormessage : message,
    oldinput : {
      name : '',
      email : '' ,
      password : '',
      confirmpassword : '',
      contactnumber : ''
    }
  })
  };

  exports.postsignup = (req ,res , next) =>{
    const email = req.body.email;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;
    const contactnumber = req.body.contactnumber;
    const name = req.body.name;

    const error = validationResult(req);
    console.log(error);
    if(!error.isEmpty()){
     return res.status(422).render('signup' , {
      pagetitle : 'signup' ,
      path : '/signup',
      isauth : false,
      errormessage : error.array()[0].msg,
      oldinput : {
        name : name,
        email : email ,
        password : password,
        confirmpassword : confirmpassword,
        contactnumber : contactnumber
      }
    })
    }
    User.findOne({email : req.body.email})
    .then(userdoc =>{
      if(userdoc){
        req.flash('error1' , 'EMAIL IS ALREADY TAKEN PLEASE TRY DIFFERENT ONE')
         return res.redirect('/signup');
      }
     return brcypt.hash(password , 12)
     .then(hashedpassword => {
      const newuser = new User({
        name : name,
        email : email,
        password: hashedpassword,
        contactnumber : contactnumber,
        cart : {
          items : []
        }
      });
      return newuser.save();
     })
     .then(result =>{
      console.log(result);
      res.redirect('/login');
     return transporter.sendMail({
        to : email,
        from: 'besthacker428@gmail.com' ,
        subject : 'Sign up succeeded' ,
        html : '<h1> WELCOME TO OUR SHOP</h1>'
      });
     
    })
    })
    .catch(err =>{
      console.log(err);
    })
    
    };

    exports.getforgotpassword = (req  ,res , next) =>{
      let message = req.flash('error1');
      if(message.length > 0){
        message = message[0];
      }
      else{
        message = null;
      }
      res.render('forgotpassword' , {
        pagetitle: 'ForgotPassword',
        path : '/forgot',
        isauth: false,
        errormessage : message
      })
    };

    exports.postforgotpassword = (req , res , next) =>{
      email = req.body.email;
      crypto.randomBytes(32 ,(err , buffer) =>{
        if(err){
          console.log(err);
        return res.redirect('/forgotpasssword');
        }
        const token = buffer.toString('hex');
        console.log(token);

        User.findOne({email : email})
        .then(user =>{
          if(!user){
            req.flash('error1', 'INVALID EMAIL ADDRESS');
            res.redirect('/forgotpassword');
          }
          user.resettoken = token;
          user.tokenexpiration = Date.now() + 3600000;
          return user.save();
        })
        .then(result =>{
          res.redirect('/');
          console.log(result);
          return transporter.sendMail({
            to : email,
            from: 'besthacker428@gmail.com' ,
            subject : 'PASSWORD RESET' ,
            html : `<h1> YOU HAVE REQUESTED PASSWORD RESET</h1>
                    <p> Click this <a href = 'http://localhost:3000/reset/${token}'> link </a> to reset your account password </p> `
         });
        })
        .catch(err =>{
          console.log(err);
        })
      
      })
    };

    exports.getresetpassword = (req , res , next) =>{
       const token = req.params.token;
     
    User.findOne({resettoken : token , tokenexpiration : {$gt : Date.now() }})
    .then(user =>{
      console.log(token);
      console.log(user);
      let message = req.flash('error1');
      if(message.length > 0){
        message = message[0];
      }
      else{
        message = null;
      }
      res.render('resetpassword' , {
        pagetitle: 'Reset Password',
        path : '/reset',
        isauth: false,
        errormessage : message,
        userid : user._id.toString(),
          token : token 
      })
    })
    .catch(err =>{
        console.log(err);
    })
     
    };
    
    exports.postresetpassword = (req , res , next) =>{

      const password = req.body.password;
      const userid = req.body.userid;
      const token = req.body.token;

      console.log(token);
      console.log(userid);
      console.log(password);
      let appuser;

      User.findOne({resettoken : token , tokenexpiration : {$gt : Date.now() } , _id: userid})
      .then(user =>{
        console.log(user);
        appuser = user;
       return brcypt.hash(password , 12);
        })
        .then(hashedpassword =>{
            appuser.password = hashedpassword;
           appuser.resettoken = undefined;
            appuser.tokenexpiration = undefined;
            return appuser.save();
        })
      .then(result =>{
        console.log(result);
       return res.redirect('/login');
      })
      .catch(err =>{
        console.log(err);
      })
    };