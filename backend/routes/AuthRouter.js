const { signup, login } = require("../controllers/AuthController");
const { signupValidation, loginValidation } = require("../middlewares/AuthValidadion");

const router = require("express").Router();

router.post('/login', loginValidation ,login);
router.post('/signup', signupValidation ,signup);

module.exports = router