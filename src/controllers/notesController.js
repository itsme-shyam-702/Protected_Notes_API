const Note = require('../models/Note.model');
const AppError = require('../utils/AppError');
const asyncWrapper = require('../utils/asyncWrapper');

// GET /notes — returns only THIS user's notes (lean for performance)
const getNotes = asyncWrapper(async (req, res) => {
  // lean() returns plain JS objects — 40% faster than full Mongoose documents
  // Use when you don't need Mongoose methods like .save() on the result
  const notes = await Note.find({ userId: req.user.id })
    .sort({ createdAt: -1 }) // newest first
    .lean();
  res.json(notes);
});

// POST /notes — create a note owned by the authenticated user
const createNote = asyncWrapper(async (req, res) => {
  const { title, content, tags } = req.body;
  const note = await Note.create({
    title,
    content,
    tags: tags || [],
    userId: req.user.id,
  });
  res.status(201).json(note);
});

// GET /notes/:id — fetch a single note (must own it)
const getNoteById = asyncWrapper(async (req, res) => {
  const note = await Note.findById(req.params.id).lean();
  if (!note) throw new AppError('Note not found', 404);
  if (note.userId.toString() !== req.user.id) {
    throw new AppError('Forbidden: not your note', 403);
  }
  res.json(note);
});

// PUT /notes/:id — update title, content, or tags
const updateNote = asyncWrapper(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) throw new AppError('Note not found', 404);
  if (note.userId.toString() !== req.user.id) {
    throw new AppError('Forbidden: not your note', 403);
  }
  const { title, content, tags } = req.body;
  if (title)   note.title   = title;
  if (content) note.content = content;
  if (tags)    note.tags    = tags;
  await note.save();
  res.json(note);
});

// DELETE /notes/:id
const deleteNote = asyncWrapper(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) throw new AppError('Note not found', 404);
  if (note.userId.toString() !== req.user.id) {
    throw new AppError('Forbidden: not your note', 403);
  }
  await note.deleteOne();
  res.json({ message: 'Note deleted' });
});

// Admin-only: GET /notes/admin/all — populated with user email
const getAllNotesAdmin = asyncWrapper(async (req, res) => {
  const notes = await Note.find()
    .populate('userId', 'email role') // JOIN: replace ObjectId with user fields
    .sort({ createdAt: -1 })
    .lean();
  res.json(notes);
});

// GET /notes/stats — aggregation pipeline: notes per tag + total count
// Interview gold: demonstrates $group, $unwind, $sort, $project in one query
const getNoteStats = asyncWrapper(async (req, res) => {
  const stats = await Note.aggregate([
    { $match: { userId: req.user._id } },        // filter to this user only
    { $unwind: { path: '$tags', preserveNullAndEmptyArrays: true } }, // one doc per tag
    {
      $group: {
        _id: '$tags',                             // group by tag value
        count: { $sum: 1 },                       // count notes per tag
        latestNote: { $max: '$createdAt' },       // most recent note with this tag
      },
    },
    { $sort: { count: -1 } },                    // most-used tags first
    {
      $project: {
        _id: 0,
        tag: { $ifNull: ['$_id', 'untagged'] },  // null tag → label as 'untagged'
        count: 1,
        latestNote: 1,
      },
    },
  ]);

  const total = await Note.countDocuments({ userId: req.user.id }); // efficient count
  res.json({ total, byTag: stats });
});

module.exports = {
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
  getAllNotesAdmin,
  getNoteStats,
};
