const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const dotenv = require("dotenv");
const { google } = require("googleapis");

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middleware CORS pour autoriser les requêtes depuis le frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Middleware pour parser le JSON et les données URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importer les routes
const ticketRoute = require("./Route/Ticket.route");
app.use("/tickets", ticketRoute);

// Connexion à MongoDB
mongoose
  .connect(
    "mongodb+srv://samar:samar11@cluster0.uxajrej.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection error:", err));

// Initialisation de OAuth2Client pour Gmail API
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

// Scopes nécessaires pour accéder aux emails Gmail
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

// Route principale pour gérer l'authentification Google et lire les emails
app.get("/", async (req, res) => {
  try {
    // Si un code d'autorisation est présent dans la requête
    if (req.query.code) {
      const { code } = req.query;
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      // Lire les emails une fois les tokens obtenus
      return await readEmails(oauth2Client, res);
    }

    // Sinon, rediriger l'utilisateur pour obtenir l'autorisation
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    return res.redirect(url);
  } catch (error) {
    console.error("Error in authentication:", error);
    res.status(500).send("Erreur lors de l'authentification");
  }
});

// Fonction pour lire les emails
async function readEmails(auth, res) {
  try {
    const gmail = google.gmail({ version: "v1", auth });
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 30,
    });

    const messages = response.data.messages || [];

    if (messages.length === 0) {
      return res.send("Aucun message trouvé");
    }

    const mails = await Promise.all(
      messages.map(
        async (message) => `<li>${await getEmail(message.id, gmail)}</li>`
      )
    );

    res.send(`<h2>Messages</h2><ul>${mails.join("")}</ul>`);
  } catch (error) {
    console.error("Error while reading emails:", error);
    res.status(500).send("Erreur lors de la récupération des emails");
  }
}

// Fonction pour obtenir les détails d'un email
async function getEmail(emailId, gmail) {
  try {
    const response = await gmail.users.messages.get({
      id: emailId,
      userId: "me",
    });
    const email = response.data;

    const headers = email.payload.headers;
    const subject =
      headers.find((e) => e.name === "Subject")?.value || "Sans sujet";
    const from =
      headers.find((e) => e.name === "From")?.value || "Expéditeur inconnu";

    return `De : <b>${from}</b><br>Sujet : ${subject}`;
  } catch (error) {
    console.error("Error while fetching email details:", error);
    return "Erreur lors de la récupération des détails de l'email";
  }
}

// Créer le serveur HTTP
const server = http.createServer(app);

// Démarrer le serveur
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
