const express = require("express");
const router = express.Router();
const { createUser, getAllUsers, getDetailUser } = require("../handlers/users");
const { createAccount, getAllAccounts, getDetailAccount } = require("../handlers/accounts");

router.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    message: "Welcome to BANK BASIC SYSTEM",
    data: null,
  });
});

// ==================== USERS ====================

router.post("/users", createUser);
router.get("/users", getAllUsers);
router.get("/users/:userId", getDetailUser);

// ==================== USERS ====================

router.post("/accounts", createAccount);
router.get("/accounts", getAllAccounts);
router.get("/accounts/:accountId", getDetailAccount);
module.exports = router;
