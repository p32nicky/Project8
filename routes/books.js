const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

/* GET All books listing. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
      res.render("index", { books, title: "Books" });
  }));

/* Render new book form. */
router.get('/new', asyncHandler(async (req, res) => {
  res.render("new-book", { book: {}, title: "New Book" });
}));

/* POST new book. */
router.post('/new', asyncHandler(async (req, res) => {
  let book
  try{
    book = await Book.create(req.body);
    res.redirect("/books" + book.id);
  } catch (error){
      if(error.name === "SequelizeValidationError") { // checking the error
        book = await Book.build(req.body);
        res.render("new-book",
        { book, errors: error.errors, title: "New Book" })
      } else {
        throw error;
    }
  }
}));

/* GET Book Edit Page. */
router.get(":id", asyncHandler(async(req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("update-book", { book, title: book.title });
  } else {
    const error = new Error('Record Not Found');
    error.stats = 500;
    next(error)
  }
}));

/* POST book Update. */
router.post('/:id', asyncHandler(async (req, res, next) => {
  try{
    const book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books/" + book.id);
    } else {
      const error = new Error('Record Not Found');
      error.stats = 404;
      next(error)
    }
  } catch (error){
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct book gets updated
      res.render("books/edit", { book, errors: error.errors, title: "Edit Book" })
    } else {
      throw error;
    }
  }
}));


/* Delete individual book. */
router.post('/:id/delete', asyncHandler(async (req ,res, next) => {

  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy(req.body);
    res.redirect("/books");
  } else {
    const error = new Error('500 Error');
    error.stats = 500;
    next(error)
  }
}));

module.exports = router;
