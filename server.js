require('dotenv').config();
const express = require('express');
const connectDB = require('./config/DbConfig');
const authRoutes  = require('./routes/auth');
const foodCategoryRoutes  = require('./routes/foodCategories');
const foodItemRoutes  = require('./routes/foodItems');
const authMiddleware = require('./middlewares/authMiddleware');
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//************************* Main Routes ************************* //
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/food-category',authMiddleware, foodCategoryRoutes);
app.use('/api/categories',authMiddleware,foodCategoryRoutes)
app.use('/api/item',authMiddleware,foodItemRoutes)




app.use('/', (req,res)=> {
    res.send("hey hello world!") 
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
