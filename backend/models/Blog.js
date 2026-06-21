import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  configuration: {
    targetAudience: {
      type: String,
      required: true
    },
    objective: {
      type: String,
      required: true
    },
    tone: {
      type: String,
      required: true
    },
    groundingContext: {
      type: String,
      default: ""
    }
  },
  outline: {
    type: Array,
    default: []
  },
  content: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, { 
  timestamps: true 
});

const Blog = mongoose.model('Blog', BlogSchema);
export default Blog;
