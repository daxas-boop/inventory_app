const mongoose = require('mongoose');

const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
});

CategorySchema.virtual('url').get(function () {
  return `/category/${this._id}/items`;
});

module.exports = mongoose.model('Category', CategorySchema);
