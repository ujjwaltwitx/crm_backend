const express = require("express");
const router = express.Router();
const ReviewModel = require("../models/review.js");

// ----------------- Review -----------------

router.post("/add-review", async (req, res) => {
  const data = req.body;
  const { name, stars, review } = data;
  if (!data) {
    return res.json({ message: "Please fill the review" });
  }

  if (!name || !stars || !review) {
    return res.json({ message: "Please fill the review" });
  }

  if (stars < 1 || stars > 5) {
    return res.json({ message: "Don't try to be smart. I am controlling it." });
  }

  try {
    const review = new ReviewModel(data);
    await review.save();
    res.status(200).json({ message: "Review added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
});

router.get("/list-reviews", async (req, res) => {
  try {
    const data = await ReviewModel.find({});
    res.json(data);
  } catch (error) {
    console.log(error);
    res.json({
      message: "Something went wrong",
      error: error,
    });
  }
});

router.get("/misc", async (req, res) => {
  try {
    const stats = await ReviewModel.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          totalStars: { $sum: "$stars" },
          avgRating: { $avg: "$stars" },
        },
      },
    ]);

    if (stats.length > 0) {
      const { totalReviews, totalStars, avgRating } = stats[0];
      const reviewStats = {
        totalReviews,
        totalStars,
        avgRating,
      };
      res.json(reviewStats);
    } else {
      res.status(404).json({ error: "No reviews found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error retrieving review statistics" });
  }
});

router.delete("/delete-review/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const review = await ReviewModel.findById(id);

    if (!review) {
      return res.json({ message: "Review not found" });
    }
    const deleted = await ReviewModel.findOneAndDelete(id);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
});

module.exports = router;
