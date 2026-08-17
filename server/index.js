require('dotenv').config();

const express = require('express');
const cors = require('cors');

const suggestionsRoutes = require('./routes/suggestionsRoutes');

const app = express();

const ALLOWED_ORIGINS = [
  'https://product-feedback-app-jana.netlify.app',
  'http://localhost:5173',
];

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

app.use('/', suggestionsRoutes);

// Generic JSON error handler — anything a controller passes to next(err)
// (e.g. a database error) lands here instead of crashing the process or
// falling back to Express's default HTML error page.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
