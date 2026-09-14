const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/section.controller');

router.get('/list', sectionController.getAllSections);
router.get('/:id', sectionController.getSectionById);
router.post('/register', sectionController.createSection);
router.put('/:id', sectionController.updateSection);
router.delete('/:id', sectionController.deleteSection);
router.put('/activate/:id', sectionController.activateSection);

module.exports = router;
