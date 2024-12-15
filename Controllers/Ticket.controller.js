const Ticket = require("../Models/Ticket.model");

const addTicket = async (req, res) => {
  try {

    const { contentMessage, source, status } = req.body;

    const newTicket = new Ticket({
      contentMessage,
      source,
      status,
    });

   
    const savedTicket = await newTicket.save();
    return res.status(201).json(savedTicket);
  } catch (err) {
    console.error("Error adding ticket:", err);
    return res.status(500).json({ error: err.message });
  }
};


const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    return res.status(200).json({ success: true, data: tickets });
  } catch (err) {
    console.error("Error fetching tickets:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch tickets", error: err.message });
  }
};

const getTicketByStatus = async (req, res) => {
  const { status } = req.params;
  try {
    const tickets = await Ticket.find({ status });
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ success: false, message: "No tickets found with the specified status" });
    }
    return res.status(200).json({ success: true, data: tickets });
  } catch (err) {
    console.error("Error retrieving tickets by status:", err);
    return res.status(500).json({ success: false, message: "Error retrieving tickets by status", error: err.message });
  }
};

const deleteTicket = async (req, res) => {
	const id = req.params.id;
	try {
		const ticket = await Ticket.findByIdAndDelete(id);
		return res.status(200).json(ticket);
	} catch (err) {
		return res.status(500).json(err);
	}
};
const updateTicket = async (req, res) => {
	const id = req.params.id;
	try {
		const ticket = await Ticket.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		return res.status(200).json(ticket);
	} catch (err) {
		return res.status(500).json(err);
	}
};
module.exports = { addTicket, getTickets, getTicketByStatus, deleteTicket, updateTicket };
