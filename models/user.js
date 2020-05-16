const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
        type:String,
        required: true
    },
    name: {
      type:String,
      required: true
  },
    password:{
        type: String,
        required : true
    },
    resettoken : {
      type : String
    },
    tokenexpiration : {
      type : Date
    },
    contactnumber : {
      type : Number ,
      required : true   
     },
    cart:{
        items: [
            {
            productId : {
                type : Schema.Types.ObjectId,
                ref: 'Product' ,
                required :true
            },
            quantity : {
                type : Number ,
                required : true
            }
        }
        ]
    },

});


userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
  
    if (cartProductIndex >= 0) {
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity
      });
    }
    const updatedCart = {
      items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
  };
  
  userSchema.methods.deletecartitems = function(productid) {
      updatedcart = this.cart.items.filter(item =>{
          return item.productId.toString() !== productid.toString();
      });
      this.cart.items = updatedcart;
      return this.save();
  };
userSchema.methods.clearcart = function(){
  this.cart = {
    items :[]
  }
  return this.save();
}
//userSchema.methods.addtocart = function(product){
 //   cartproductindex = this.cart.items.findIndex(item =>{
 //       return item.productid.toString() === product._id.toString();
 //   })

 //   let newquantity = 1;
 //   const updatedcartitems = [...this.cart.items];

 //   if(cartproductindex){
   //     newquantity = 1;
  //  }
   // else{
   //    updatedcartitems.push({
    //        productid : product._id ,
    //       quantity : newquantity
     //   })
 //   }
  // const updatedcart = {
  //      items : updatedcartitems
  //  };

  //  this.cart = updatedcart;
  //  return this.save();
    
//}

module.exports = mongoose.model('User' , userSchema);
