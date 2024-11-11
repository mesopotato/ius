// utils/vectorUtils.js

function combineAndRankVectors(
  similarSummariesVectorList,
  similarSachverhalteVectorList,
  similarEntscheideVectorList,
  similarGrundlagenVectorList,
  topN
) {
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
  const similarSummariesVectorList = await db.findSimilarVectors(
    targetVector,
    'summary_vector',
    topN
  );
  if (process.env.NODE_ENV === 'development') {
    console.log('found similar summaries');
  }
  const similarSachverhalteVectorList = await db.findSimilarVectors(
    targetVector,
    'sachverhalt_vector',
    topN
  );
  if (process.env.NODE_ENV === 'development') {
    console.log('found similar sachverhalte');
  }
  const similarEntscheideVectorList = await db.findSimilarVectors(
    targetVector,
    'entscheid_vector',
    topN
  );
  if (process.env.NODE_ENV === 'development') {
    console.log('found similar entscheide');
  }
  const similarGrundlagenVectorList = await db.findSimilarVectors(
    targetVector,
    'grundlagen_vector',
    topN
  );
  if (process.env.NODE_ENV === 'development') {
    console.log('found similar grundlagen');
  }

  const topCombinedVectors = combineAndRankVectors(
    similarSummariesVectorList,
    similarSachverhalteVectorList,
    similarEntscheideVectorList,
    similarGrundlagenVectorList,
    topN
  );
  if (process.env.NODE_ENV === 'development') {
    console.log('combined and ranked vectors');
  }

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
  if (process.env.NODE_ENV === 'development') {
    console.log('found similar articles');
  }
  const similarArticles = await db.getArticlesFromVectors(similarVectors);
  if (process.env.NODE_ENV === 'development') {
    console.log('got articles from vectors');
  }
    return similarArticles;
}

module.exports = {
  combineAndRankVectors,
  findSimilarDocuments,
  findRechtsgrundlage,
};
