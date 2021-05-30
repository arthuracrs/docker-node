const express = require("express")
const mongoose = require("mongoose")
const redis = require("redis")
const session = require("express-session")
const cors = require("cors")

const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_IP,
    MONGO_PORT,
    REDIS_URL,
    REDIS_PORT,
    SESSION_SECRET
} = require("./config/config")

let RedisStore = require("connect-redis")(session)
let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT
})

const postRouter = require("./routes/postRouter")
const userRouter = require("./routes/userRouter")

const connectWithRetry = () => {
    mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => { console.log("Succesfully connected to database") })
        .catch((e) => {
            console.log(e)
            setTimeout(connectWithRetry, 5000)
        })
}

connectWithRetry()

const app = express()

app.get('/api/v1/', (req, res) => {
    res.send('<h2>She depends on you!!!!!!</h2>')
    console.log('salveeee')
})

app.enable("trust proxy")
app.use(cors({
    
}))
app.use(express.json())
app.use(session({
    store: new RedisStore({
        client: redisClient
    }),
    secret: SESSION_SECRET,
    cookie:{
        secure: false,
        resave: false,
        saveUnintialized: false,
        httpOnly: true,
        maxAge: 60000
    }
}))

app.use('/api/v1/posts', postRouter)
app.use('/api/v1/users', userRouter)

const port = process.env.PORT || 3000

app.listen(port, () => { console.log('Listening on port ' + port) })
