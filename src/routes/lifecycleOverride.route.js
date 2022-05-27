const express = require('express')
const lifecycleViolationController = require('../controllers/lifecycleViolation.controller')

const router = express.Router()

router.post('/license', lifecycleViolationController.create)
router.post('/security', lifecycleViolationController.create)

module.exports = router
