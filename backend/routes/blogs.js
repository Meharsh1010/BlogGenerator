import express from 'express';
import Blog from '../models/Blog.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Apply protection middleware to all blog routes
router.use(protect);

// @desc    Get all blogs for current user
// @route   GET /api/blogs
// @access  Private
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    console.error(`Get Blogs Route Error: ${error.message}`);
    res.status(500).json({ error: 'Server error retrieving blogs' });
  }
});

// @desc    Get single blog by ID
// @route   GET /api/blogs/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found or unauthorized' });
    }
    res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error(`Get Single Blog Route Error: ${error.message}`);
    res.status(500).json({ error: 'Server error retrieving blog' });
  }
});

// @desc    Create a new blog shell
// @route   POST /api/blogs
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, configuration } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Please provide a title' });
    }

    const targetAudience = configuration?.targetAudience || 'Casual Readers';
    const objective = configuration?.objective || 'Inform/Educate';
    const tone = configuration?.tone || 'Empathetic';
    const groundingContext = configuration?.groundingContext || '';

    const blog = await Blog.create({
      userId: req.user.id,
      title,
      configuration: {
        targetAudience,
        objective,
        tone,
        groundingContext
      },
      outline: [],
      content: '',
      status: 'draft'
    });

    res.status(201).json({ success: true, blog });
  } catch (error) {
    console.error(`Create Blog Route Error: ${error.message}`);
    res.status(500).json({ error: 'Server error creating blog' });
  }
});

// @desc    Update / save a blog draft
// @route   PUT /api/blogs/:id/save
// @access  Private
router.put('/:id/save', async (req, res) => {
  try {
    const { title, content, outline, status } = req.body;

    // Secure check: verify blog belongs to user
    const blog = await Blog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found or unauthorized' });
    }

    // Update fields if provided
    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = content;
    if (outline !== undefined) blog.outline = outline;
    if (status !== undefined) blog.status = status;

    await blog.save();

    res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error(`Save Blog Route Error: ${error.message}`);
    res.status(500).json({ error: 'Server error saving blog' });
  }
});

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found or unauthorized' });
    }
    res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error(`Delete Blog Route Error: ${error.message}`);
    res.status(500).json({ error: 'Server error deleting blog' });
  }
});

export default router;
