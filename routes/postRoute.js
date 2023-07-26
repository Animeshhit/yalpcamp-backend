const Router = require("express").Router();
const Post = require("../model/postmodel");
const { authenticateToken } = require("../middalware/index");

Router.get("/posts", async (req, res) => {
  try {
    const allPosts = await Post.find({});
    res.json({ posts: allPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

Router.get("/post", async (req, res) => {
  try {
    let postId = req.query.id;
    const post = await Post.findById({ _id: postId });
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
    const post = await Post.findById({ _id: postId });
    if (!post) {
      return res.status(404).json({ message: "Not Found!" });
    }

    post.comments.push(req.body);

    const updatedPost = await post.save();
    res.json({ post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(err);
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

module.exports = Router;
