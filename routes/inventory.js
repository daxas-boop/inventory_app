const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const categoryController = require('../controller/categoryController');
const itemController = require('../controller/itemController');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/images');
  },
  filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/// CATEGORY ROUTES ///
router.get('/', categoryController.index);
router.get('/category/create', categoryController.categoryCreateGet);
router.post(
  '/category/create',
  upload.single('image'),
  categoryController.categoryCreatePost
);
router.get('/category/:id/delete', categoryController.categoryDeleteGet);
router.post('/category/:id/delete', categoryController.categoryDeletePost);
router.get('/category/:id/update', categoryController.categoryUpdateGet);
router.post(
  '/category/:id/update',
  upload.single('image'),
  categoryController.categoryUpdatePost
);
router.get('/category/:id/items', categoryController.categoryItems);
router.get('/categories', categoryController.categoryList);

/// ITEM ROUTES ///
router.get('/item/create', itemController.itemCreateGet);
router.post(
  '/item/create',
  upload.single('image'),
  itemController.itemCreatePost
);
router.get('/item/:id/delete', itemController.itemDeleteGet);
router.post('/item/:id/delete', itemController.itemDeletePost);
router.get('/item/:id/update', itemController.itemUpdateGet);
router.post(
  '/item/:id/update',
  upload.single('image'),
  itemController.itemUpdatePost
);
router.get('/item/:id', itemController.itemDetail);
router.get('/items', itemController.itemList);

module.exports = router;
