if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./util/ExpressError.js');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const userRouter = require('./routes/user.js');

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');

const MONGO_URL = process.env.MONGO_URL;
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then((result) => {
    console.log('connection with db');
  })
  .catch((err) => {
    console.log(err);
  });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: { secret: process.env.SESSION_SECRET || process.env.SECRET },
  touchAfter: 24 * 3600,
});

const sessionOptions = {
  store: store,
  secret: process.env.SESSION_SECRET || process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currUser = req.user;
  next();
});

//this middleware is used tp prevent request time out on uploading image via multer cloudinary
app.use((req, res, next) => {
  res.setTimeout(0); // Disable timeout for long uploads
  next();
});

//merging listing router and reviews router
app.get('/', (req, res) => {
  res.redirect('/listings');
});
app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);

//custom error throwing if any invalid api is called
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, 'Page not found'));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = 'something went wrong' } = err;
  res.render('error.ejs', { message });
});

app.listen(2020, () => {
  console.log('listening on port 2020');
});
