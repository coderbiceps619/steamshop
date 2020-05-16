const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
 imgurl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  steamId: {
    type: String,
    required: true
  },
  steampassword: {
    type: String,
    required: true
  },
  price: {
    type : Number,
    required : true
  },
  userid : {
    type : Schema.Types.ObjectId,
    ref : 'User',
    required :true
  }

});

module.exports = mongoose.model('Product', productSchema);