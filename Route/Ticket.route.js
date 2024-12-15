const express = require("express");
const { addTicket, getTickets, updateTicket, getTicketByStatus, deleteTicket } = require("../Controllers/Ticket.controller");
const router = express.Router();


router.post('/addTicket', addTicket);
router.get('/getAllTickets', getTickets);
router.put('/update/:id', updateTicket);
router.get('/getByStatus/:status', getTicketByStatus);
router.delete('/delete/:id', deleteTicket);

module.exports = router;
