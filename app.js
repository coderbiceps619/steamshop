const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const multer = require('multer');
const mongoose = require('mongoose');
const User = require('./models/user');
const app = express();
const helmet = require('helmet');
const stripe = require('stripe')('sk_test_bR91izX4vLiwfnpmznILatUl00CJtWAT55');

const MongoDBuri = process.env.MONGO_URL;

const store = new MongoDBStore({
    uri : MongoDBuri ,
    collection : 'session',

});

const filestorage = multer.diskStorage({
  destination : (req , file , cb) =>{
    cb(null , 'images');
  },
  filename : (req , file , cb) =>{
    cb(null , file.filename + file.originalname);
  }
});

const filefilter = (req, file , cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null , true);
  }
  else{
    cb(null , false);
  }
};

app.set('view engine' , 'ejs');
app.set('views' , 'views');


app.use(bodyparser.urlencoded({extended:false}));
app.use(multer({storage : filestorage , fileFilter : filefilter}).single('imgurl'));
app.use(express.static(path.join(__dirname , 'public')));
app.use('/images' , express.static(path.join(__dirname , 'images')));
app.use(session(
{
    secret : 'mysecret' , 
    resave : false , 
    saveUninitialized : false,
    store : store
})
);

app.use(flash());
app.use(helmet());

app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => console.log(err));
  });

  
 

adminRoutes = require('./routes/admin');
shopRoutes = require('./routes/shop');
authRoutes = require('./routes/auth');

app.use('/home' , (req ,res , next) =>{
    res.render('mainhome' , {
      path: '/mainhome',
      isauth : req.session.isloggedin
    });
})

app.use(shopRoutes);
app.use(adminRoutes);
app.use(authRoutes);


mongoose.connect(MongoDBuri)
.then(result =>{
    app.listen(process.env.PORT || 3000);
    console.log(result); 
})
.catch(err =>{
    console.log(err);
});

