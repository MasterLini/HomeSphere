const express = require('express');
const path = require('path');
const router = express.Router();

// Serve static files for API documentation
router.use('/api', express.static(path.join(__dirname, '../public/api')));

// Serve the main HTML file
router.get('/api', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/api/index.html'));
});

module.exports = router;
