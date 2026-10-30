
const NewsletterSubscriber = require("../models/newsletterModel");

exports.subscribeNewsletter = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const existingSubscriber =
      await NewsletterSubscriber.findOne({ email });

    if (existingSubscriber) {
      return res.status(200).json({
        success: true,
        message: "You are already subscribed to our newsletter"
      });
    }

    await NewsletterSubscriber.create({ email });

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully! You will receive new job alerts."
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "You are already subscribed to our newsletter"
      });
    }

    console.error("Newsletter subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to subscribe. Please try again."
    });
  }
};
