require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../firebase");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed"
    });
  }

  try {
    const { artworkId, question } = req.body;

    if (!artworkId || !question) {
      return res.status(400).json({
        error: "artworkId and question are required"
      });
    }

    // Get artwork from Firestore
    const artworkDoc = await db
      .collection("artworks")
      .doc(artworkId)
      .get();

    if (!artworkDoc.exists) {
      return res.status(404).json({
        error: "Artwork not found"
      });
    }

    const artwork = artworkDoc.data();

    // Ask Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-3.7-flash"
    });

    const prompt = `
You are Sutrā, an AI art guide.

Help the user understand an artwork in simple, engaging language.

Do not invent historical facts.
If something is uncertain, clearly say that it is uncertain.

Here is the artwork information:

Title: ${artwork.title || "Unknown"}
Artist: ${artwork.artist || "Unknown"}
Location: ${artwork.location || "Unknown"}

The user asks:

${question}

Answer the user's question clearly and naturally.
`;

    let result;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    result = await model.generateContent(prompt);
    break;
  } catch (error) {
    if (attempt === 3) {
      throw error;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

const response = await result.response;
const answer = response.text();

    return res.status(200).json({
      answer: answer
    });

} catch (error) {
  console.error("Ask Art error:", error);

  return res.status(500).json({
    error: "Something went wrong while processing the artwork."
  });
}
};