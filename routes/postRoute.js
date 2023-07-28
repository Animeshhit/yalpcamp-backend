const Router = require("express").Router();
const Post = require("../model/postmodel");
const { authenticateToken } = require("../middalware/index");

Router.get("/posts", async (req, res) => {
  try {
    const allPosts = await Post.find({}).select({
      title: 1,
      description: 1,
      image: 1,
      _id: 1,
    });
    res.json({ posts: allPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

Router.get("/post", async (req, res) => {
  try {
    let postId = req.query.id;
    const post = await Post.findById({ _id: postId }).select({
      _id: 1,
      title: 1,
      description: 1,
      price: 1,
      userId: 1,
      image: 1,
      userName: 1,
      comments: 1,
      createdAt: 1,
    });
    if (post) {
      res.json({ post });
    } else {
      res.status(404).json({ message: "Not Found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

Router.post("/newPost", authenticateToken, async (req, res) => {
  try {
    const { title, description, price, image, userId, userName } = req.body;
    const newPost = new Post({
      title,
      description,
      price,
      userId,
      image,
      userName,
    });
    const savedPost = await newPost.save();
    res.json({ post: newPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

Router.post("/newComment", authenticateToken, async (req, res) => {
  try {
    let postId = req.query.id;
    const post = await Post.findById({ _id: postId }).select({
      comments: 1,
    });
    if (!post) {
      return res.status(404).json({ message: "Not Found!" });
    }

    post.comments.push(req.body);

    const updatedPost = await post.save();
    res.json({ post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
});

Router.delete("/deleteComment", authenticateToken, async (req, res) => {
  try {
    let postId = req.query.postId;
    let commentId = req.query.commentId;
    const post = await Post.findById({ _id: postId });
    if (!post) {
      throw new Error("Post not found");
    }
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }

    post.comments.splice(commentIndex, 1);

    const updatedPost = await post.save();
    res.json({ post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

Router.get("/post/search", async (req, res) => {
  const { q } = req.query;
  try {
    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Please provide a search word." });
    }
    // Create a case-insensitive regular expression using the searchWord
    const searchRegex = new RegExp(q, "i");

    // Build the search query based on the regular expression
    const searchQuery = { title: searchRegex };
    // Perform the search using the built query
    const posts = await Post.find(searchQuery).select({
      title: 1,
      description: 1,
      image: 1,
      _id: 1,
    });

    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: "No posts found matching the search criteria." });
    }

    res.json({ posts });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "An error occurred while searching for posts.",
      error: err,
    });
  }
});

module.exports = Router;
