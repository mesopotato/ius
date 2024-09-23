# iusapi

npm install express pg openai dotenv

or npm init if you cloned it..

exposed one endpoint "search" which is enough for now. 
takes in a user query -> embeds it -> does the cosine similarity search on postgres -> retrieves the data linked to the vectors and passes it to LLM for the "chat" feeling. 

search results are also returned raw as json as well for display 