const express = require('express')
const lifecycleViolationController = require('../controllers/lifecycleViolation.controller')

const router = express.Router()

router.post('/', lifecycleViolationController.create)

module.exports = router
