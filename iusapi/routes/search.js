// routes/search.js

const express = require('express');
const router = express.Router();

const { generateEmbeddingPure } = require('../utils/embeddings');
const {
  findSimilarDocuments,
  findRechtsgrundlage,
} = require('../utils/vectorUtils');
const DBManager = require('../db/dbManager');
const openai = require('../openaiClient');

router.post('/', async (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Request received');
    console.log('/api/search called with body:', req.body);
  }
  
  try {
    const user_input = req.body.query;
    const top_n = 5;
    const db = new DBManager();

    const target_vector = await generateEmbeddingPure(user_input);

    if (!target_vector) {
      return res
        .status(500)
        .json({ error: 'Failed to generate embedding for user input.' });
    }

    const similar_documents = await findSimilarDocuments(
      target_vector,
      db,
      top_n
    );
    const similar_articles = await findRechtsgrundlage(
      target_vector,
      db,
      top_n
    );

    // Generate the prompt for the LLM
    let articlesText = similar_articles
      .map((article) => article.full_article)
      .join('\n\n');
    let documentsText = similar_documents.map((doc) => doc.text).join('\n\n');

    // Ensure the total tokens are within the model's limit
    const MAX_PROMPT_TOKENS = 128000; // Adjust based on the model's limit
    const combinedText = `${articlesText}\n\n${documentsText}`;
    const truncatedText = combinedText.substring(0, MAX_PROMPT_TOKENS);

    const prompt = `Ein user hat folgende Frage gestellt: "${user_input}". Die Frage ist wahreitsgetreu zu beantworten. Wie würde sie von einem Rechtswissenschaftler beantwortet werden? \nHier sind einige Artikel und Präzedenzfälle die bei deiner Antwort helfen können: \n\n${truncatedText}\n\n Zitiere möglichst viele Artikel wenn sie relevant sind. Wie sind die Konsequenzen einzuordenen wenn man den Konsensus der Artikel und Präzedenzfälle betrachtet? Informiere den User über die Rechtslage und die möglichen Konsequenzen und gib ihm möglichst viele Informationen auf seine Frage : "${user_input}".`;

    // Generate the LLM response
    if (process.env.NODE_ENV === 'development') {
      console.log('Prompt for LLM:', prompt);
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or 'gpt-4' if you have access
      messages: [
        {
          role: 'system',
          content:
            'Du bist ein schweizerischer Rechtswissenschaftler, das Fragem zu schweizerischen Rechtsgrundlagen beantwortet also artikel erklärt und Präzedenzfälle intepretiert. Du beziehst dich auf relevante artikel im Schweizerischen Rechtskontext, zitierst diese und erklärst deren Bedeutung.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const llm_response = completion.choices[0].message.content;

    res.json({
      user_input: user_input,
      documents: similar_documents,
      articles: similar_articles,
      llm_response: llm_response,
    });
  } catch (error) {
    console.error(`Error in /api/search: ${error}`);
    res.status(500).json({ error: 'An error occurred.' });
  }
});

module.exports = router;
