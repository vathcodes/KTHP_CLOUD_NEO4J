
import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import foodRouter from './routes/foodRoute.js'
import userRouter from './routes/userRoute.js'

import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import { connectDB } from './config/db.js'

//app config
const app = express()
const port = process.env.PORT || 4000

//middleware
app.use(express.json())
app.use(cors())

connectDB()
// api endpoints
app.use("/api/food", foodRouter)
app.use("/images", express.static('uploads'))
app.use("/api/users", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)

app.get("/", (req, res) => {
    res.send(`
        <h1 style="text-align:center; color: #ff6600;">
            🍔 Welcome to AECO22 Food API! 🍕
        </h1>
        <p style="text-align:center; font-size: 18px;">
            Available endpoints:
        </p>
       
       
    `);
});


app.listen(port,()=>{
    console.log(`Server running on http://localhost:${port}`)  
})