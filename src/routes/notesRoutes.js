const express = require('express');
const router  = express.Router();
const verifyToken  = require('../middleware/verifyToken');
const requireRole  = require('../middleware/requireRole');
const validateBody = require('../middleware/validateBody');
const { createNoteSchema, updateNoteSchema } = require('../utils/schemas');
const {
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
  getAllNotesAdmin,
  getNoteStats,
} = require('../controllers/notes.controller');

// All routes below require a valid JWT
router.use(verifyToken);

router.get('/', getNotes);
router.post('/', validateBody(createNoteSchema), createNote);
router.get('/stats', getNoteStats);              // NEW: aggregation stats endpoint
router.get('/admin/all', requireRole('admin'), getAllNotesAdmin);
router.get('/:id', getNoteById);
router.put('/:id', validateBody(updateNoteSchema), updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
