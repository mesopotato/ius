// utils/embeddings.js

const openai = require('../openaiClient');

async function generateEmbeddingPure(text, model = 'text-embedding-3-small') {
  if (process.env.NODE_ENV === 'development') {
    console.log('generateEmbeddingPure called with text:', text);
  }
  if (typeof text !== 'string' || !text.trim()) {
    console.log(
      'Invalid or empty text input detected, returning zero vector.'
    );
    return new Array(1536).fill(0); // Return zero vector
  }
  text = text.replace(/\n/g, ' ');
  try {
    console.log('Generating embedding for text:', text);
    const response = await openai.embeddings.create({
      input: text,
      model: model,
    });

    const embeddingVector = response.data[0].embedding;

    return embeddingVector;
  } catch (error) {
    console.error(`An error occurred: ${error}`);
    return new Array(1536).fill(0);
  }
}

module.exports = {
  generateEmbeddingPure,
};
