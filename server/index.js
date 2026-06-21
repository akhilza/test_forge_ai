const express = require('express');
const cors = require('cors');
require('dotenv').config();

const generateRoute = require('./routes/generate');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', generateRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`TestForge server running on port ${PORT}`));