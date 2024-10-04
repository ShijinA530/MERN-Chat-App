const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const connectDB = require('./config/db')
const PORT = process.env.PORT || 5000
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const cors = require('cors');

var corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}
  
connectDB()
const app = express()
app.use(cors(corsOptions))
app.use(express.json())   // to accept json data from frontend

app.get('/', (req, res) => {
    res.send("API running")
})

app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})