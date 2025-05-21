const express = require('express');
const router = express.Router();
const FoodItem = require('../models/foodItemModels');
const Rating = require('../models/RatingModel');
const Wishlist = require('../models/WishListModel');
const Cart = require('../models/CartModel');
const Purchase = require('../models/PurchaseModel');
const upload = require('../middlewares/uploader');
const createUploader = require('../utils/uploadUtil');


router.get('/food-items', async (req, res) => {
  try {
    const userId = req.user.userId;
    const foodItems = await FoodItem.find().lean();

    const foodItemIds = foodItems.map(item => item._id);

    const [userRatings, userWishlist] = await Promise.all([
      Rating.find({ user: userId, foodItem: { $in: foodItemIds } }).lean(),
      Wishlist.find({ user: userId, foodItem: { $in: foodItemIds } }).lean()
    ]);

    const ratingMap = {};
    userRatings.forEach(r => ratingMap[r.foodItem.toString()] = r.rating);

    const wishlistSet = new Set(userWishlist.map(w => w.foodItem.toString()));

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const result = foodItems.map(item => ({
      ...item,
      imageUrl: `${baseUrl}`+item.imageUrl,
      userRating: ratingMap[item._id.toString()] || null,
      isWishlisted: wishlistSet.has(item._id.toString())
    }));

    res.status(200).json({
        message: 'Success', 
        data: result 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/add', (req,res) => {

    try {
        const upload = createUploader('uploads/foodItems');
        console.log("BODY " , req.body)
        upload.single('image')(req, res, async (error) => {
              if (error) {
                return res.status(400).json({ error: error.message });
              }
        
              try {
                const { itemName, description , price   } = req.body;
        
                if (!req.file) {
                  return res.status(400).json({ message: 'Image is required' });
                }
        
                const imageUrl = `/${req.file.destination}/${req.file.filename}`;
        
                const newItem = new FoodItem({
                  itemName,
                  description,
                  imageUrl,
                  price
                });
        
                await newItem.save();
        
                return res.status(201).json({
                  message: 'Item created successfully',
                  data: newItem
                });
        
              } catch (error) {
                return res.status(500).json({ error: error.message });
              }
            });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/add-wishlist' , async(req, res) => {

        try {
            const { id } = req.body;
            const userId = req.user.userId
          
            if( !id ) {
                return res.status(403).json({
                    message:"Item Id is Required!"
                })
            }

            const item = await FoodItem.findById(id)

            if( !item ) {
                return res.status(422).json({
                    message:"Item Does not Exist!"
                })
            }


            const wishlist = await Wishlist.findOneAndUpdate(
                { user: userId, foodItem: id },
                {}, 
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );


            return res.status(200).json({
                message:"Added to Wishlist!"
            });

        } catch (error) {
           res.status(500).json({ error: error.message }); 
        }
});


router.post('/add-rating' , async(req, res) => {

        try {
            const { id , rating } = req.body;
            const userId = req.user.userId
          
            if( !id ) {
                return res.status(403).json({
                    message:"Item Id is Required!"
                })
            }

            if( rating <= 0 || rating > 5 || !rating ) {
                return res.status(403).json({
                    message:"Rating Id is Required! and Should be Between 1-5"
                })
            }
            const item = await FoodItem.findById(id)

            if( !item ) {
                return res.status(422).json({
                    message:"Item Does not Exist!"
                })
            }


            const ratingDoc = await Rating.findOneAndUpdate(
                { user: userId, foodItem: id },
                { rating }, 
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            const stats = await Rating.aggregate([
                { $match: { foodItem: item._id } },
                {
                    $group: {
                    _id: '$foodItem',
                    avgRating: { $avg: '$rating' },
                    ratingCount: { $sum: 1 }
                    }
                }
            ]);

            if (stats.length > 0) {
                const { avgRating, ratingCount } = stats[0];

                item.avgRating = avgRating;
                item.ratingCount = ratingCount;
                await item.save();
            }


            return res.status(200).json({
                message:"Rating Added!"
            });

        } catch (error) {
            console.log(error)
           res.status(500).json({ error: error.message }); 
        }
});


router.post('/add-to-cart' , async(req, res) => {

        try {
            const { id  } = req.body;
            const userId = req.user.userId
          
            if( !id ) {
                return res.status(403).json({
                    message:"Item Id is Required!"
                })
            }

            
            const item = await FoodItem.findById(id)

            if( !item ) {
                return res.status(422).json({
                    message:"Item Does not Exist!"
                })
            }


            const UserCart = await Cart.findOneAndUpdate(
                { user: userId, itemId: id },
                {}, 
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );


            return res.status(200).json({
                message:"Added To Cart Successfully!"
            });

        } catch (error) {
           res.status(500).json({ error: error.message }); 
        }
});


router.post('/remove-from-cart' , async(req, res) => {

    try {
        const { id  } = req.body;
        const userId = req.user.userId
        
        if( !id ) {
            return res.status(403).json({
                message:"Item Id is Required!"
            })
        }

        const result = await Cart.deleteOne({ user: userId, itemId: id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        return res.status(200).json({
            message:"Item Removed From Cart!"
        });

    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
});


router.get('/get-user-cart' , async(req,res) => {

    try {
        const userId = req.user.userId;
        const userCartData = await Cart.find({user:userId}).populate('itemId');

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const userCart = userCartData.map( item => ({
            ...item._doc,
            itemId: {
                ...item.itemId._doc,
                imageUrl: `${baseUrl}${item.itemId.imageUrl}`
            }
        }))

        return res.status(200).json({
            message: "successfully Fetched User Cart",
            data: userCart
        })
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
    

})


router.post('/buy-item' , async(req, res) => {

    try {
        const { id , isCart } = req.body;
        const userId = req.user.userId
        
        /**
         * Purchasing from Cart 
         */
        if( isCart ) {

            /**
             * Checking if the Cart is Empty or not for User
             */
            const cartItems = await Cart.find({ user: userId });

            if (cartItems.length === 0) {
                return res.status(400).json({ message: "Cart is empty!" });
            }

            /**
             * Removing All the items from Cart Tp Purcahse Collection
             */
            const purchases = cartItems.map(item => ({
                user: item.user,
                itemId: item.itemId,
                purchasedAt: new Date()
            }));

            await Purchase.insertMany(purchases);

            /** 
             * Delete all cart items for user
             */ 
            await Cart.deleteMany({ user: userId });


            return res.status(200).json({ 
                message: "Purchase successful!" 
            });

        } else {
        
            /**
             * Purchasing Single Item 
             */
            if( !id ) {
                return res.status(403).json({
                    message:"Item Id is Required!"
                })
            }

            const item = await FoodItem.findById(id)

            if( !item ) {
                return res.status(422).json({
                    message:"Item Does not Exist!"
                })
            }

            const purchaseItem = new Purchase({
                user: userId,
                itemId: id,
                purchasedAt: new Date()
            })
           
            await purchaseItem.save();


            return res.status(200).json({
                message:"Success!"
            });

        }  

    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
});


router.get('/get-user-purchase-history' , async(req,res) => {

    try {
        const userId = req.user.userId;
        const userCartData = await Purchase.find({user:userId}).populate('itemId');

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const userCart = userCartData.map( item => ({
            ...item._doc,
            itemId: {
                ...item.itemId._doc,
                imageUrl: `${baseUrl}${item.itemId.imageUrl}`
            }
        }))

        return res.status(200).json({
            message: "successfully Fetched User Purchase Histotry",
            data: userCart
        })
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
    

})



module.exports = router;