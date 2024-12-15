const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    contentMessage: { type: String, required: true },
    source: { type: String, required: true },
    status: {
      type: String,
      enum: ["INIT", "REVIEWED", "PENDING", "RESOLVED"],
      required: true,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", TicketSchema);
