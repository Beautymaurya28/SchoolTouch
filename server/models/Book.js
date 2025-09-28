const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  isbn: {
    type: String,
    unique: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  availableQuantity: {
    type: Number,
    default: 1,
  },
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;