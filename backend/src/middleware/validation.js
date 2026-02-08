const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '验证失败',
      errors: errors.array()
    });
  }
  next();
};

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名长度必须在3-50个字符之间'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少为6个字符'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('请输入真实姓名'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .notEmpty()
    .withMessage('请输入密码'),
  handleValidationErrors
];

const bookValidation = [
  body('isbn')
    .trim()
    .notEmpty()
    .withMessage('请输入ISBN'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('请输入书名'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('请输入作者'),
  body('totalQuantity')
    .isInt({ min: 1 })
    .withMessage('库存数量必须大于0'),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  bookValidation,
  handleValidationErrors
};
