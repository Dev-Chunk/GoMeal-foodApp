
const express = require('express');
const router = express.Router();
const FoodCategory = require('../models/FoodCategory');
const upload = require('../middlewares/uploader');
const createUploader = require('../utils/uploadUtil');

router.post('/add', async (req, res) => {
  try {
    const upload = createUploader('uploads/categories'); 

    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const { itemName, description } = req.body;

        if (!req.file) {
          return res.status(400).json({ message: 'Image is required' });
        }

        const imageUrl = `/${req.file.destination}/${req.file.filename}`;

        const newCategory = new FoodCategory({
          itemName,
          description,
          imageUrl
        });

        await newCategory.save();

        return res.status(201).json({
          message: 'Category created successfully',
          data: newCategory
        });

      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/category-list', async(req,res) => {
  try{
    const limit =  parseInt(req.query.limit) || 10;
    const categoriesDoc = await FoodCategory.find().limit(limit)
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const categories = categoriesDoc.map(cat => ({
        ...cat._doc,
        imageUrl : `${baseUrl}`+cat.imageUrl
    }));

    return res.status(200).json({
      message: "Success",
      data:categories
    });

  } catch(error) {
    res.status(500).json({ error: error.message });
  }

})


module.exports = router;
