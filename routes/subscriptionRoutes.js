const express = require("express");
const router = express.Router();
const { sendSubscriptionEmail } = require("../controllers/subscriptionController");

router.post("/send", sendSubscriptionEmail);

module.exports = router;
