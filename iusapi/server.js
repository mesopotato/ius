// server.js

require('dotenv').config();
const fetch = require('node-fetch');

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
app.use(cors(
  {
    origin: process.env.CORS_ORIGIN || 'http://localhost',
  }
));
app.use(express.json());

// Example of conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log('Server is running in development mode.');
}

// from dotenv import RECAPTCHA_SECRET_KEY
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const { Pool } = require('pg');

// Function to generate embedding
async function generateEmbeddingPure(text, model = 'text-embedding-3-small') {
  if (process.env.NODE_ENV === 'development') {
    console.log('generateEmbeddingPure called with text:', text);
  }
  if (typeof text !== 'string' || !text.trim()) {
    console.log("Invalid or empty text input detected, returning zero vector.");
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

// Database Manager Class
// this should be in a separate file.. but ok for now
class DBManager {
  constructor() {
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
    });
    if (process.env.NODE_ENV === 'development') {
      console.log('DBManager initialized with config:', {
        host: process.env.POSTGRES_HOST || 'localhost',
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
      });
    }
  }

  // Method to find similar vectors
  async findSimilarVectors(targetVector, columnName, topN) {
    if (process.env.NODE_ENV === 'development') {
      console.log('findSimilarVectors called with targetVector: ', 'columnName:', columnName, 'topN:', topN);
    }
    const vectorStr = '[' + targetVector.join(',') + ']';
    const query = `
      SELECT id, parsed_id, ${columnName}, ${columnName} <=> $1::vector AS distance
      FROM e_bern_summary
      WHERE ${columnName} IS NOT NULL
      ORDER BY distance ASC
      LIMIT $2
    `;
    try {
      const res = await this.pool.query(query, [vectorStr, topN]);
      return res.rows.map(row => [row.id, row.parsed_id, row.distance]);
    } catch (err) {
      console.error(`Error retrieving similar vectors: ${err}`);
      return [];
    }
  }

  // Method to find similar article vectors
  async findSimilarArticleVectors(targetVector, topN) {
    if (process.env.NODE_ENV === 'development') {
      console.log('findSimilarArticleVectors called with targetVector:','topN:', topN);
    }
    const vectorStr = '[' + targetVector.join(',') + ']';
    const query = `
      SELECT id, srn, art_id, type_cd, type_id, vector, source_table, vector <=> $1::vector AS distance
      FROM articles_vector
      WHERE vector IS NOT NULL
      ORDER BY distance ASC
      LIMIT $2
    `;
    try {
      const res = await this.pool.query(query, [vectorStr, topN]);
      return res.rows.map(row => ({
        id: row.id,
        srn: row.srn,
        art_id: row.art_id,
        type_cd: row.type_cd,
        type_id: row.type_id,
        distance: row.distance,
        vector: row.vector,
        source_table: row.source_table,
      }));
    } catch (err) {
      console.error(`Error retrieving similar article vectors: ${err}`);
      return [];
    }
  }

  // Method to get texts from vectors
  async getTextsFromVectors(vectorList) {
    if (process.env.NODE_ENV === 'development') {
      console.log('getTextsFromVectors called with vectorList:');
    }
    const texts = [];
    try {
      for (const [id, parsed_id, distance] of vectorList) {
        const query = `
          SELECT s.id, s.parsed_id, r.forderung, e.file_path, r.datum, r.case_number, r.signatur, r.source
          FROM e_bern_summary s
          JOIN e_bern_parsed e ON s.parsed_id = e.id
          JOIN e_bern_raw r ON e.file_name = r.file_name
          WHERE s.parsed_id = $1
        `;
        const res = await this.pool.query(query, [parsed_id]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          texts.push({
            id: row.id,
            parsed_id: row.parsed_id,
            forderung: row.forderung,
            file_path: `https://www.entscheidsuche.ch/docs/${row.file_path}`,
            datum : row.datum,
            case_number: row.case_number,
            signatur: row.signatur,
            source: row.source,
            similarity: distance,
          });
        }
      }
      return texts;
    } catch (err) {
      console.error(`Error retrieving texts from vectors: ${err}`);
      return [];
    }
  }

  // Method to get articles from vectors
  async getArticlesFromVectors(vectorList) {
    if (process.env.NODE_ENV === 'development') {
      console.log('getArticlesFromVectors called with vectorList:');
    }
    const texts = [];
    try {
      for (const item of vectorList) {
        const {
          id,
          srn,
          art_id,
          type_cd,
          type_id,
          distance,
          vector,
          source_table,
        } = item;

        if (source_table === 'articles') {
          const query = `
            SELECT 
              a.srn, 
              a.shortname,
              a.book_name,
              a.part_name,
              a.title_name, 
              a.sub_title_name, 
              a.chapter_name, 
              a.sub_chapter_name, 
              a.section_name, 
              a.sub_section_name, 
              a.article_id AS art_id,
              STRING_AGG(
                CONCAT_WS(' ',
                  COALESCE(a.article_name, ''),
                  COALESCE(a.reference, ''),
                  COALESCE(a.ziffer_name, ''),
                  COALESCE(a.absatz, ''),
                  COALESCE(a.text_w_footnotes, '')
                ),
                ' ' ORDER BY a.id
              ) AS full_article, 
			  l.title, 
			  l.sourcelink
            FROM 
              articles a
            join lawtext l on a.srn = l.srn  
            WHERE 
              a.srn = $1
              AND a.article_id = $2
            GROUP BY 
              a.srn, 
              a.shortname,
              a.book_name,
              a.part_name,
              a.title_name, 
              a.sub_title_name, 
              a.chapter_name, 
              a.sub_chapter_name, 
              a.section_name, 
              a.sub_section_name, 
              a.article_id,
			   l.title, 
			  l.sourcelink
          `;
          const res = await this.pool.query(query, [srn, art_id]);
          if (res.rows.length > 0) {
            const row = res.rows[0];
            texts.push({
              srn: row.srn,
              shortName: row.shortname,
              book_name: row.book_name,
              part_name: row.part_name,
              title_name: row.title_name,
              sub_title_name: row.sub_title_name,
              chapter_name: row.chapter_name,
              sub_chapter_name: row.sub_chapter_name,
              section_name: row.section_name,
              sub_section_name: row.sub_section_name,
              art_id: row.art_id,
              full_article: row.full_article,
              title: row.title,
              sourcelink: row.sourcelink,
              source_table: source_table,
              similarity: distance,
            });
          }
        } else if (source_table === 'articles_bern') {
          const query = `
            SELECT                                                  
              a.systematic_number AS srn, 
              a.abbreviation,
              a.book_name, 
              a.part_name, 
              a.title_name, 
              a.sub_title_name, 
              a.chapter_name, 
              a.sub_chapter_name, 
              a.section_name, 
              a.sub_section_name, 
              a.article_number AS art_id,
              STRING_AGG(
                CONCAT_WS(' ',
                  COALESCE(a.article_title, ''),
                  COALESCE(a.paragraph_text, '')
                ),
                ' ' ORDER BY a.id
              ) AS full_article, 
			  l.title,
			  l.source_url
            FROM articles_bern a 
            join lawtext_bern l on a.systematic_number = l.systematic_number 
            WHERE 
              a.systematic_number = $1
              AND a.article_number = $2
            GROUP BY
              a.systematic_number,
              a.abbreviation,
              a.book_name,
              a.part_name,
              a.title_name,
              a.sub_title_name,
              a.chapter_name,
              a.sub_chapter_name,
              a.section_name,
              a.sub_section_name,
              a.article_number,
			  l.title,
			  l.source_url
          `;
          const res = await this.pool.query(query, [srn, art_id]);
          if (res.rows.length > 0) {
            const row = res.rows[0];
            texts.push({
              srn: row.srn,
              shortName: row.abbreviation,
              book_name: row.book_name,
              part_name: row.part_name,
              title_name: row.title_name,
              sub_title_name: row.sub_title_name,
              chapter_name: row.chapter_name,
              sub_chapter_name: row.sub_chapter_name,
              section_name: row.section_name,
              sub_section_name: row.sub_section_name,
              art_id: row.art_id,
              full_article: row.full_article,
              title: row.title,
              sourcelink: row.source_url,
              source_table: source_table,
              similarity: distance,
            });
          }
        }
      }
      return texts;
    } catch (err) {
      console.error(`Error retrieving articles from vectors: ${err}`);
      return [];
    }
  }
}

// Function to combine and rank vectors
function combineAndRankVectors(similarSummariesVectorList, similarSachverhalteVectorList,
                               similarEntscheideVectorList, similarGrundlagenVectorList, topN) {
  let combinedVectors = [];

  for (const vector of similarSummariesVectorList) {
    combinedVectors.push({ vector: vector, origin: 'Summary' });
  }

  for (const vector of similarSachverhalteVectorList) {
    combinedVectors.push({ vector: vector, origin: 'Sachverhalt' });
  }

  for (const vector of similarEntscheideVectorList) {
    combinedVectors.push({ vector: vector, origin: 'Entscheide' });
  }

  for (const vector of similarGrundlagenVectorList) {
    combinedVectors.push({ vector: vector, origin: 'Grundlagen' });
  }

  // Sort by distance in ascending order
  combinedVectors.sort((a, b) => a.vector[2] - b.vector[2]); // vector[2] is distance

  const topVectors = combinedVectors.slice(0, topN);

  return topVectors;
}

// Function to find similar documents
async function findSimilarDocuments(targetVector, db, topN) {
  if (process.env.NODE_ENV === 'development') {
    console.log('findSimilarDocuments called with targetVector:', 'topN:', topN);
  }
  const similarSummariesVectorList = await db.findSimilarVectors(targetVector, 'summary_vector', topN);
  console.log('found similar summaries');
  const similarSachverhalteVectorList = await db.findSimilarVectors(targetVector, 'sachverhalt_vector', topN);
  console.log('found similar sachverhalte');
  const similarEntscheideVectorList = await db.findSimilarVectors(targetVector, 'entscheid_vector', topN);
  console.log('found similar entscheide');
  const similarGrundlagenVectorList = await db.findSimilarVectors(targetVector, 'grundlagen_vector', topN);
  console.log('found similar grundlagen ... combining and ranking vectors');

  const topCombinedVectors = combineAndRankVectors(similarSummariesVectorList, similarSachverhalteVectorList,
    similarEntscheideVectorList, similarGrundlagenVectorList, topN);
  console.log('combined and ranked vectors');

  const results = [];
  for (const item of topCombinedVectors) {
    const { vector, origin } = item;
    const [id, parsed_id, distance] = vector;
    const text_info = await db.getTextsFromVectors([[id, parsed_id, distance]]);
    if (text_info.length > 0) {
      const text = text_info[0];
      results.push({
        origin: origin,
        id: text.id,
        parsed_id: text.parsed_id,
        similarity: distance.toFixed(4),
        text: text.summary_text,
        sachverhalt: text.sachverhalt,
        entscheid: text.entscheid,
        grundlagen: text.grundlagen,
        forderung: text.forderung,
        file_path: text.file_path,
        datum: text.datum,
        case_number: text.case_number,
        signatur: text.signatur,
        source: text.source,
      });
    }
  }
  return results;
}

// Function to find similar articles
async function findRechtsgrundlage(targetVector, db, topN) {
  if (process.env.NODE_ENV === 'development') {
    console.log('findRechtsgrundlage called with targetVector:', 'topN:', topN);
  }
  const similarVectors = await db.findSimilarArticleVectors(targetVector, topN);
  console.log('found similar articles');
  const similarArticles = await db.getArticlesFromVectors(similarVectors);
  console.log('got articles from vectors');
  return similarArticles;
}

// API Endpoint
app.post('/api/search', async (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('/api/search called with body:', req.body);
  }
  console.log('Request received');
  try {
    const user_input = req.body.query;
    const top_n = 5;
    const db = new DBManager();

    const target_vector = await generateEmbeddingPure(user_input);

    if (!target_vector) {
      return res.status(500).json({ error: 'Failed to generate embedding for user input.' });
    }

    const similar_documents = await findSimilarDocuments(target_vector, db, top_n);
    const similar_articles = await findRechtsgrundlage(target_vector, db, top_n);

    // Generate the prompt for the LLM
    let articlesText = similar_articles.map(article => article.full_article).join('\n\n');
    let documentsText = similar_documents.map(doc => doc.text).join('\n\n');

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
        { "role": "system", "content": "Du bist ein schweizerischer Rechtswissenschaftler, das Fragem zu schweizerischen Rechtsgrundlagen beantwortet also artikel erklärt und Präzedenzfälle intepretiert. Du beziehst dich auf relevante artikel im Schweizerischen Rechtskontext, zitierst diese und erklärst deren Bedeutung." },
        { "role": "user", "content": prompt }
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
    console.error(`Error in /search: ${error}`);
    res.status(500).json({ error: 'An error occurred.' });
  }
});

// CAPTCHA Verification Endpoint
app.post('/api/verify-recaptcha', async (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('/api/verify-recaptcha called with body:', req.body);
  }
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is missing' });
  }

  try {
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`;

    const { data } = await axios.post(verificationURL);

    if (data.success) {
      // CAPTCHA verified successfully
      console.log('reCAPTCHA verification successful');
      res.status(200).json({ success: true });
    } else {
      // Verification failed
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      res.status(400).json({ success: false, errors: data['error-codes'] });
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Server is running in development mode.');
    console.log(process.env);
  }else {
    console.log('Server is running in production mode.');
  }
});
