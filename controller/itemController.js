const { validationResult, body } = require('express-validator');
const async = require('async');
const fs = require('fs');
const Item = require('../models/item');
const Category = require('../models/category');

exports.itemList = (req, res, next) => {
  Item.find().exec((err, items) => {
    if (err) {
      return next(err);
    }
    res.render('item_list', {
      items,
    });
  });
};

exports.itemCreateGet = (req, res, next) => {
  Category.find({}, 'name').exec((error, categories) => {
    if (error) {
      return next(error);
    }
    res.render('item_form', {
      categories,
    });
  });
};

exports.itemCreatePost = [
  // Validation
  body('name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Name must be specified.'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Description must be specified.'),
  body('price')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Price must be specified.'),
  body('number_stock')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Number stock must be specified.'),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          return next(err);
        }
      });
      Category.find({}, 'name').exec((error, categories) => {
        res.render('item_form', {
          item: req.body,
          categories,
          errors: errors.array(),
        });
      });
    } else {
      const item = new Item({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        number_stock: req.body.number_stock,
        category: req.body.category,
        image: req.file.path,
      });
      item.save((error) => {
        if (error) {
          return next(error);
        }
        res.redirect(item.url);
      });
    }
  },
];

exports.itemDeleteGet = (req, res, next) => {
  Item.findById(req.params.id).exec((error, item) => {
    if (error) {
      return next(error);
    }
    res.render('item_delete', {
      item,
    });
  });
};

exports.itemDeletePost = (req, res, next) => {
  if (req.body.password !== process.env.ADMIN_PASSWORD) {
    const error = new Error('Wrong admin password');
    error.status = 401;
    return next(error);
  }
  Item.findByIdAndRemove(req.body.itemid, {}, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/items');
  });
};

exports.itemUpdateGet = (req, res, next) => {
  async.parallel(
    {
      item: (callback) => {
        Item.findById(req.params.id).exec(callback);
      },
      categories: (callback) => {
        Category.find({}, 'name').exec(callback);
      },
    },
    (error, results) => {
      if (error) {
        return next(error);
      }
      if (results.item === null) {
        const err = new Error('Item not found');
        err.status = 404;
        return next(err);
      }
      res.render('item_form', {
        item: results.item,
        categories: results.categories,
      });
    }
  );
};

exports.itemUpdatePost = [
  // Validation
  body('name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Name must be specified.'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Description must be specified.'),
  body('price')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Price must be specified.'),
  body('number_stock')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Number stock must be specified.'),
  (req, res, next) => {
    if (req.body.password !== process.env.ADMIN_PASSWORD) {
      const error = new Error('Wrong admin password');
      error.status = 401;
      return next(error);
    }

    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      number_stock: req.body.number_stock,
      category: req.body.category,
      _id: req.params.id,
    });

    if (req.file) {
      item.image = req.file.path;
    }

    if (!errors.isEmpty()) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          return next(err);
        }
      });
      Category.find({}, 'name').exec((error, categories) => {
        if (error) {
          return next(error);
        }
        res.render('item_form', {
          item,
          categories,
          errors: errors.array(),
        });
      });
    } else {
      Item.findByIdAndUpdate(req.params.id, item, {}, (error, theitem) => {
        if (error) {
          return next(error);
        }
        res.redirect(theitem.url);
      });
    }
  },
];

exports.itemDetail = (req, res, next) => {
  Item.findById(req.params.id).exec((error, item) => {
    if (error) {
      return next(error);
    }
    if (item === null) {
      const err = new Error('Item not found');
      err.status = 404;
      return next(err);
    }
    res.render('item_details', {
      item,
    });
  });
};
