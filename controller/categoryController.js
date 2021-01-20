const { body, validationResult } = require('express-validator');
const async = require('async');
const fs = require('fs');
const Category = require('../models/category');
const Item = require('../models/item');

exports.index = (req, res) => {
  res.redirect('/categories');
};

exports.categoryList = (req, res, next) => {
  Category.find().exec((err, categories) => {
    if (err) {
      return next(err);
    }
    res.render('category_list', {
      categories,
    });
  });
};

exports.categoryCreateGet = (req, res) => {
  res.render('category_form');
};

exports.categoryCreatePost = [
  // Validation
  body('name')
    .trim()
    .isLength({ min: 1, max: 30 })
    .escape()
    .withMessage('Name must be specified.')
    .isAlphanumeric()
    .withMessage('Name has non-alphanumeric characters.'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Description must be specified.'),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          return next(err);
        }
      });
      res.render('category_form', {
        category: req.body,
        errors: errors.array(),
      });
    } else {
      const category = new Category({
        name: req.body.name,
        description: req.body.description,
        image: req.file.path,
      });
      category.save((error) => {
        if (error) {
          return next(error);
        }
        res.redirect(category.url);
      });
    }
  },
];

exports.categoryDeleteGet = (req, res, next) => {
  async.parallel(
    {
      category: (callback) => {
        Category.findById(req.params.id).exec(callback);
      },
      items: (callback) => {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    (error, results) => {
      if (error) {
        return next(error);
      }
      if (results.category === null) {
        const err = new Error('Category not found');
        err.status = 404;
        return next(err);
      }
      res.render('category_delete', {
        category: results.category,
        items: results.items,
      });
    }
  );
};

exports.categoryDeletePost = (req, res, next) => {
  if (req.body.password !== process.env.ADMIN_PASSWORD) {
    const error = new Error('Wrong admin password');
    error.status = 401;
    return next(error);
  }
  async.parallel(
    {
      category: (callback) => {
        Category.findById(req.params.id).exec(callback);
      },
      items: (callback) => {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    (error, results) => {
      if (error) {
        return next(error);
      }
      if (results.category === null) {
        const err = new Error('Category not found');
        err.status = 404;
        return next(err);
      }
      if (results.items.length > 0) {
        res.render('category_delete', {
          category: results.category,
          items: results.items,
        });
      } else {
        Category.findByIdAndRemove(req.body.categoryid, {}, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect('/categories');
        });
      }
    }
  );
};

exports.categoryUpdateGet = (req, res, next) => {
  Category.findById(req.params.id).exec((error, category) => {
    if (error) {
      return next(error);
    }
    res.render('category_form', {
      category,
    });
  });
};

exports.categoryUpdatePost = [
  // Validation
  body('name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Name must be specified.')
    .isAlphanumeric()
    .withMessage('Name has non-alphanumeric characters.'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Description must be specified.'),

  (req, res, next) => {
    if (req.body.password !== process.env.ADMIN_PASSWORD) {
      const error = new Error('Wrong admin password');
      error.status = 401;
      return next(error);
    }
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (req.file) {
      category.image = req.file.path;
    }

    if (!errors.isEmpty()) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          return next(err);
        }
      });
      res.render('category_form', {
        category,
        errors: errors.array(),
      });
    } else {
      Category.findByIdAndUpdate(
        req.params.id,
        category,
        {},
        (error, thecategory) => {
          if (error) {
            return next(error);
          }
          res.redirect(thecategory.url);
        }
      );
    }
  },
];

exports.categoryItems = (req, res, next) => {
  async.parallel(
    {
      category: (callback) => {
        Category.findById(req.params.id).exec(callback);
      },
      items: (callback) => {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    (error, results) => {
      if (error) {
        return next(error);
      }
      if (results.category === null) {
        const err = new Error('Category not found.');
        err.status = 404;
        return next(err);
      }
      res.render('category_items', {
        category: results.category,
        items: results.items,
      });
    }
  );
};
