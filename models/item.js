const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
  title: {
    required: true,
    type: String
  },
  link: {
    required: true,
    type: String
  },
  categoryId: {
    required: true,
    type: String
  },
  itemId: {
    required: true,
    type: String
  },
  image: {
    required: true,
    type: String
  },
  description: {
    required: false,
    type: String
  },
  size: {
    required: false,
    type: String
  },
  stock: {
    required: true,
    type: Number
  },
  price: {
    required: true,
    type: Number
  }
})

module.exports = mongoose.model('Item', dataSchema)