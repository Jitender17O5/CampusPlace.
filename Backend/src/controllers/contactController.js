
const ContactMessage = require("../models/contactModel");
const mongoose = require("mongoose");


// ================= SUBMIT CONTACT MESSAGE =================

exports.submitContactMessage = async (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;

    // Check required fields
    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    // Save message in MongoDB
    await ContactMessage.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully!"
    });

  } catch (error) {
    console.error("Contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again."
    });
  }
};


// ================= GET ALL CONTACT MESSAGES =================

exports.getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });

  } catch (error) {
    console.error("Get contact messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages"
    });
  }
};


// ================= MARK MESSAGE AS READ =================

exports.markContactMessageRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!mongoose.isValidObjectId(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID"
      });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      messageId,
      { status: "read" },
      { returnDocument: "after" }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message marked as read",
      contactMessage: message
    });

  } catch (error) {
    console.error("Update contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update contact message"
    });
  }
};
