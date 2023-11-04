// create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Store comments in memory
const commentsByPostId = {};

// Handle events
app.post('/events', async (req, res) => {
  const { type, data } = req.body;
  // Handle CommentCreated event
  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;
    // Store comment in memory
    const comments = commentsByPostId[postId] || [];
    comments.push({ id, content, status });
    commentsByPostId[postId] = comments;
    // Send event to moderation service
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentModerated',
      data: { id, content, postId, status },
    });
  }
  // Handle CommentUpdated event
  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;
    // Update comment in memory
    const comments = commentsByPostId[postId];
    const comment = comments.find((comment) => comment.id === id);
    comment.status = status;
    comment.content = content;
    // Send event to moderation service
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentModerated',
      data: { id, content, postId, status },
    });
  }
  res.send({});
});

// Handle get comments
app.get('/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  const comments = commentsByPostId[postId] || [];
  res.send(comments);
});

// Handle post comments
app.post('/posts/:id/comments', async (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;
  // Store comment in memory
  const comments = commentsByPostId[postId] || [];
  const id = Math.random().toString(36).substring(2, 15);
  const status = 'pending';
  comments.push({ id, content, status });
  commentsByPostId[postId] = comments;
  // Send event to event bus
  await

    axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: { id, content, postId, status },
        });