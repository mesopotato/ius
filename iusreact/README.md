to set up shadcn thingy 

create git repo

run npx shadcn@latest init (outside of git folder i guess)
default / neutral 

https://ui.shadcn.com/docs/installation/next

add components with npx shadcn@latest add button card input tabs etc

npm run dev to run on 3000 

runs like a charm as long as it does nothing funny.. 

#ToDO

-User Account Management CRM / Auth 
-page lock -> to prevent bots from using the API key ;)
-User History table/ UserCase Table 
-Session Handling 
-optional : WebHooks for streaming (insead of waiting for the response)
-Animations (like typing when LLM is called)
-Input bar could be textarea bacoming bigger and scrollable if input is big
-citations from the LLM could be linked to the law-search results
-difficult : if the LLM cites something which has not been retrieved by the similartity search -> still ensure that it is retrieved. 
-buttons below the search bar like + or ! do nothing ..  
-the chat will not remember the previous discussion -> could be also a feature dont know if possible yet