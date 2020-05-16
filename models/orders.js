const mongoose = require('mongoose');
const Product = require('../models/product');
const filehelper = require('../util/filehelper');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products :[ 
        {
        product : {
            type : Object ,
            required : true
           }
        }
],

user : {
    name : {
        type : String ,
        required : true
    },
    userid :{
        type : Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    } 
}
});
  
orderSchema.methods.deleteitems = function(){
  this.products.forEach(p => {
      Product.findById(p.product._id)
      .then(product =>{
          filehelper.deleteFile(product.imgurl);
      })
      Product.findByIdAndRemove(p.product._id)
      .then(result =>{
          console.log(result);
          console.log("success");
      })
  });  
};

module.exports = mongoose.model('Orders' , orderSchema);
