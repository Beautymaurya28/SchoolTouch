const Book = require('../models/Book');
const Issue = require('../models/Issue');

// @desc    Admin adds a new book to the library
// @route   POST /api/library/books
const addBook = async (req, res) => {
  const { title, author, isbn, quantity } = req.body;
  try {
    const bookExists = await Book.findOne({ isbn });
    if (bookExists) {
      // If book exists, just increase quantity
      bookExists.quantity += quantity;
      bookExists.availableQuantity += quantity;
      await bookExists.save();
      return res.status(200).json({ message: 'Book quantity updated successfully', book: bookExists });
    }
    const newBook = new Book({ title, author, isbn, quantity, availableQuantity: quantity });
    await newBook.save();
    res.status(201).json({ message: 'Book added successfully', book: newBook });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin/Teacher issues a book to a student
// @route   POST /api/library/issue
const issueBook = async (req, res) => {
  const { studentId, bookId } = req.body;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.availableQuantity <= 0) {
      return res.status(400).json({ message: 'This book is currently unavailable' });
    }

    const newIssue = new Issue({ student: studentId, book: bookId });
    await newIssue.save();

    book.availableQuantity -= 1;
    await book.save();

    res.status(201).json({ message: 'Book issued successfully', issue: newIssue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin/Teacher records a book return
// @route   PUT /api/library/return/:issueId
const returnBook = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue record not found' });
    }
    if (issue.isReturned) {
      return res.status(400).json({ message: 'This book has already been returned' });
    }

    issue.isReturned = true;
    issue.returnDate = Date.now();
    await issue.save();

    const book = await Book.findById(issue.book);
    if (book) {
      book.availableQuantity += 1;
      await book.save();
    }

    res.json({ message: 'Book returned successfully', issue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Student gets all books they've borrowed
// @route   GET /api/library/student/:studentId
const getStudentIssuedBooks = async (req, res) => {
  const studentId = req.user.profileId;
  try {
    const issuedBooks = await Issue.find({ student: studentId, isReturned: false })
      .populate('book', 'title author');
    res.json(issuedBooks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin/Teacher gets a list of all books
// @route   GET /api/library/books
const getBooks = async (req, res) => {
    try {
        const books = await Book.find({});
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Admin/Teacher gets a list of all issued books
// @route   GET /api/library/issued
const getIssuedBooks = async (req, res) => {
    try {
        const issuedBooks = await Issue.find({ isReturned: false })
            .populate('student', 'name rollNumber')
            .populate('book', 'title author');
        res.json(issuedBooks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
  addBook,
  issueBook,
  returnBook,
  getStudentIssuedBooks,
  getBooks,
  getIssuedBooks,
};