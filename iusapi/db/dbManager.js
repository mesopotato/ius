// db/dbManager.js

const { Pool } = require('pg');

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
      console.log(
        'findSimilarVectors called with targetVector: ',
        'columnName:',
        columnName,
        'topN:',
        topN
      );
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
      return res.rows.map((row) => [row.id, row.parsed_id, row.distance]);
    } catch (err) {
      console.error(`Error retrieving similar vectors: ${err}`);
      return [];
    }
  }

  // Method to find similar article vectors
  async findSimilarArticleVectors(targetVector, topN) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'findSimilarArticleVectors called with targetVector:',
        'topN:',
        topN
      );
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
      return res.rows.map((row) => ({
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
            datum: row.datum,
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
            JOIN lawtext l ON a.srn = l.srn  
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
            JOIN lawtext_bern l ON a.systematic_number = l.systematic_number 
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

module.exports = DBManager;
