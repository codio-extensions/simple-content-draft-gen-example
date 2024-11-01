// Wrapping the whole extension in a JS function 
// (ensures all global variables set in this extension cannot be referenced outside its scope)
(async function(codioIDE, window) {
  
  // Refer to Anthropic's guide on system prompts here: https://docs.anthropic.com/claude/docs/system-prompts
   const systemPrompt = `You are a helpful assistant helping write educational content for novice learners. 
  You will be provided with instructions on what to draft a page of content on. Follow those instructions carefully.`

  
  // register(id: unique button id, name: name of button visible in Coach, function: function to call when button is clicked) 
  codioIDE.coachBot.register("contentGen", "Generate a page of content", onButtonPress)

  // function called when I have a question button is pressed
  async function onButtonPress() {

    // Function that automatically collects all available context 
    // returns the following object: {guidesPage, assignmentData, files, error}
    const context = await codioIDE.coachBot.getContext()

    input = await codioIDE.coachBot.input("Please type or paste your instructions here!")

    const userPrompt = `Here are the teacher instructions for the page of content to generate. 

    <instructions>
    ${input}
    </instructions>

    Think step by step in a <scratchpad> about what would make a well-structured page of educational material based on the instructions provided.
    <scratchpad>
    Your analysis goes here
    </scratchpad>

    Based on your analysis, generate a page (no more than 500 words) of content for novice learners in the <content> tag. Use markdown formatting for headings and bullets and code snippets with correct syntax highlighting as well.

    <content>
    [The page of content goes here]
    </content>
    `

    codioIDE.coachBot.write(`Analyzing instructions and working on generating page… just a few moments please… `)
  
  
    // the messages object that will contain the user prompt and/or any assistant responses to be sent to the LLM
    // Refer to Anthropic's guide on the messages API here: https://docs.anthropic.com/en/api/messages
    let messages = []

    // Add user prompt to messages object
    messages.push({
        "role": "user", 
        "content": userPrompt
    })

    // Send the API request to the LLM with all prompts and context 
    const result = await codioIDE.coachBot.ask({
      systemPrompt: systemPrompt,
      messages: messages
    }, {stream: false})

  try {
        const page_res = await window.codioIDE.guides.structure.add({
            title: "Generated Page", 
            type: window.codioIDE.guides.structure.ITEM_TYPES.PAGE,
            layout: window.codioIDE.guides.structure.LAYOUT.L_1_PANEL,
            content: `${result.result}`,
        })
        
        console.log('add item result', page_res) // returns added item: {id: '...', title: '...', type: '...', children: [...]}
    } catch (e) {
        console.error(e)
    }
    codioIDE.coachBot.write(`Added a new page of content!! `)
    codioIDE.coachBot.showMenu() 
    
    
  }
// calling the function immediately by passing the required variables
})(window.codioIDE, window)

 

  
  
