import { GoogleGenAI, Type } from "@google/genai";

let aiClient: typeof GoogleGenAI.prototype | null = null;
function getAiClient() {
  if (!aiClient) {
    let key = '';
    try { key = (import.meta as any).env.VITE_GEMINI_API_KEY || ''; } catch(e) {}
    if (!key) {
      try { key = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY || '' : ''; } catch(e) {}
    }
    if (!key) {
      console.error("GEMINI_API_KEY is missing!");
    }
    aiClient = new GoogleGenAI({ apiKey: key || 'missing_key' });
  }
  return aiClient;
}

export async function extractKnowledgeFromFile(file: File): Promise<string> {
  const ai = getAiClient();
  
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string; 
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const mimeType = file.type;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: "Extract and summarize the key educational and academic information from this document. Provide pure text that can be used as knowledge reference for an IELTS test. Do not include any conversational filler." },
          { inlineData: { data: base64, mimeType } }
        ]
      }
    ]
  });

  return response.text || "No content extracted.";
}

export async function scoreIELTSEssay(prompt: string, essay: string, taskType: 1 | 2) {
  const systemInstruction = `
  You are a brutally honest and fully certified IELTS examiner. You work exactly like the real British Council and IDP scoring system. Your job is to give the student the most accurate and realistic band score possible, not to encourage them, not to be polite, and not to assume effort where there is none. A fake high score harms the student more than an honest low score because it creates false confidence before their real exam.

  For the Writing section, you must evaluate strictly on all four official IELTS criteria which are Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy. If the student submitted a blank response, the score is 0. If they wrote fewer than 30 words, the maximum score allowed is 1.5. If they wrote random words or gibberish with no meaning, the maximum score is 2.0. If they wrote something very poor but at least attempted the task, the score range is 2.0 to 3.5. A score of 5.0 means genuinely average real-world English. A score of 7.0 or above means the student is genuinely strong in English. You are not allowed to give above 3.5 unless the writing shows a clear genuine attempt with real sentences, vocabulary, and structure.

  Always be fair, and always remember that being fair means being accurate.

  Evaluate the following Writing Task ${taskType} essay based on the prompt.
  
  Return a JSON object ALWAYS matching this structure exactly:
  {
    "band": number,
    "feedback": "A short honest two-sentence feedback note explaining exactly why the student received that score",
    "breakdown": {
      "taskResponse": number,
      "coherence": number,
      "vocab": number,
      "grammar": number
    },
    "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
  }
  `;

  try {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const responseText = await Promise.race([
          getAiClient().models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Prompt: ${prompt}\n\nEssay: ${essay}`,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  band: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                  breakdown: {
                    type: Type.OBJECT,
                    properties: {
                      taskResponse: { type: Type.NUMBER },
                      coherence: { type: Type.NUMBER },
                      vocab: { type: Type.NUMBER },
                      grammar: { type: Type.NUMBER }
                    },
                    required: ["taskResponse", "coherence", "vocab", "grammar"]
                  },
                  suggestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["band", "feedback", "breakdown", "suggestions"]
              }
            }
          }).then(res => res.text),
          new Promise<string>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 45000))
        ]);

        return JSON.parse(responseText || '{}');
      } catch (e: any) {
        if (attempt === 2) throw e;
      }
    }
  } catch (error) {
    console.error("AI Scoring Error:", error);
    return { 
      band: 0, 
      feedback: "Error processing score.", 
      breakdown: { taskResponse: 0, coherence: 0, vocab: 0, grammar: 0 },
      suggestions: ["Try submitting again", "Ensure your essay is long enough"]
    };
  }
}

export async function scoreIELTSSpeaking(userResponses: (string | { base64: string, mimeType: string })[]) {
  const systemInstruction = `
  You are a brutally honest and fully certified IELTS examiner. You work exactly like the real British Council and IDP scoring system. Your job is to give the student the most accurate and realistic band score possible, not to encourage them, not to be polite, and not to assume effort where there is none. A fake high score harms the student more than an honest low score because it creates false confidence before their real exam.

  For the Speaking section, you must carefully listen to the provided audio recordings (or read the transcripts if audio failed). Evaluate strictly on all four official IELTS speaking criteria: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation.
  If the recording is silent, or only has short fillers like "um", "uh", with no real content, the score must be 0 to 1.0. If the student spoke for under 20 seconds total across all parts with minimal content, the maximum score is 2.0. Silence is not fluency. Treat an empty or near-empty speaking response exactly the way a real IELTS examiner would treat it, which is an immediate near-zero score.
  
  Always be fair, and always remember that being fair means being accurate.

  Evaluate the following Speaking audio responses.
  
  Return a JSON object ALWAYS matching this structure exactly:
  {
    "band": number,
    "feedback": "A short honest two-sentence feedback note explaining exactly why the student received that score",
    "breakdown": {
      "fluency": number,
      "pronunciation": number,
      "vocab": number,
      "grammar": number
    },
    "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
  }
  `;

  try {
    const parts: any[] = [ "Evaluate the following Speaking interview responses:" ];
    
    for (const response of userResponses) {
      if (typeof response === 'string') {
        parts.push(response);
      } else if (response && response.base64) {
        parts.push({
          inlineData: {
            data: response.base64,
            mimeType: response.mimeType
          }
        });
      }
    }

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const responseText = await Promise.race([
          getAiClient().models.generateContent({
            model: "gemini-2.5-flash",
            contents: parts,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  band: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                  breakdown: {
                    type: Type.OBJECT,
                    properties: {
                      fluency: { type: Type.NUMBER },
                      pronunciation: { type: Type.NUMBER },
                      vocab: { type: Type.NUMBER },
                      grammar: { type: Type.NUMBER }
                    },
                    required: ["fluency", "pronunciation", "vocab", "grammar"]
                  },
                  suggestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["band", "feedback", "breakdown", "suggestions"]
              }
            }
          }).then(res => res.text),
          new Promise<string>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 45000))
        ]);

        return JSON.parse(responseText || '{}');
      } catch (e: any) {
        if (attempt === 2) throw e;
      }
    }
  } catch (error) {
    console.error("AI Speaking Scoring Error:", error);
    return { 
      band: 0, 
      feedback: "Error processing speak score.", 
      breakdown: { fluency: 0, pronunciation: 0, vocab: 0, grammar: 0 },
      suggestions: [] 
    };
  }
}

export async function generateDynamicTestSet(
  options: string[] | { knowledgeRefs?: string[]; customFilfoId?: string; customFilfoTitle?: string }, 
  difficulty: string = "Average",
  onProgress?: (message: string, progress: number) => void
) {
  let finalRefs: string[] = [];
  if (Array.isArray(options)) {
    finalRefs = options;
  } else {
    if (options.customFilfoId || options.customFilfoTitle) {
      try {
        const filfoData = JSON.parse(localStorage.getItem('filfo_practice') || '[]');
        const match = filfoData.find((d: any) => 
          (options.customFilfoId && d.id === options.customFilfoId) ||
          (options.customFilfoTitle && d.title === options.customFilfoTitle)
        );
        if (match) {
          finalRefs = [`Title: ${match.title}\nAdmin Assigned Difficulty: ${match.difficulty || 'Average'}\nContent: ${match.content}${match.imageUrl ? `\nImage URL: ${match.imageUrl}` : ''}`];
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
    if (finalRefs.length === 0 && options.knowledgeRefs) {
      finalRefs = options.knowledgeRefs;
    }
  }

  const baseRules = `
  You are an advanced IELTS test generation engine connected to a custom knowledge vault called FILFO. Your entire behavior is governed by the following rules without exception.
  
  TARGET STUDENT DIFFICULTY LEVEL: ${difficulty}

  You have a built-in knowledge source stored in your context from the Official IELTS Academic Sample Test 2023 sourced from ielts.org. This source contains real listening scripts about second-hand furniture, student research discussions, and learner persistence lectures. It contains real reading passages about Marie Curie and older workers in the modern workforce. It contains real writing tasks about internet access data across four countries and the university tuition debate. It contains real speaking topics about hometown, studies, hobbies, tourism, and travel. Whenever you generate any question for any section, you must randomly pull from this built-in knowledge source alongside any FILFO Reference Knowledge entries the user has added. Do not always use the same passage or topic. Pick randomly each time so every test feels different. Never reveal correct answers during the test. Only show them after submission on the results screen.

  FILFO ENTRY — OFFICIAL IELTS ACADEMIC SAMPLE TEST 2023
  TITLE: Official IELTS Academic Complete Sample Test 2023
  SOURCE: ielts.org Official Academic Sample Materials
  SECTIONS COVERED: Listening, Reading, Writing, Speaking
  SUITABLE FOR: All question types in both Practice Mode and Full IELTS Test Mode
  DIFFICULTY LEVEL: Intermediate to Advanced — Band 6.0 to 8.0

  LISTENING KNOWLEDGE BANK:
  Use the following real IELTS listening content to generate questions. Section 1 is a conversation between two people about second-hand furniture. The seller's name is Johnson, contact number is 07712 445 886, the dining table is dark brown and seats 6 people, the bookcase height is approximately 180 cm, the armchair is in good condition, the dining table costs 85 dollars, the address is Maple Street, available from Saturday onwards, and free delivery is included. Generate Note Completion questions, Form Completion questions, and Short Answer questions from this content. Section 3 is an educational discussion between a student named Judy, her tutor, and fellow students about a research project. Judy's research focuses on the relationship between motivation and learning outcomes. The tutor suggests she should review existing literature more thoroughly. The problem with her methodology is that the questionnaire has ambiguous wording. The tutor finds the variation between different subject groups most interesting. Judy plans to conduct follow-up interviews next. Generate Multiple Choice Questions with tricky distractors from this content where all options sound plausible but only one is correct. Section 4 is a university lecture about learner persistence. Key findings are that student motivation is linked to a key predictor, study environment affects concentration and needs management, peer support increases performance by 40 percent, short-term goals are more effective than long-term goals, self-regulation is strongest in adult learners, weekly feedback is ideal, visual learning style is preferred, and external pressure reduces engagement. Generate Table Completion and Note Completion questions from this content.

  READING KNOWLEDGE BANK:
  Use the following two real IELTS academic reading passages to generate questions.
  Passage 1 is about Marie Curie. She was a physicist and chemist who researched radioactivity. She was the first woman to win a Nobel Prize, the first person to win it twice, and the only person to win in two different sciences which were Physics in 1903 and Chemistry in 1911. She was born Maria Sklodowska in Warsaw Poland and moved to Paris in 1891. She married Pierre Curie in 1895 and together they discovered polonium named after her homeland and radium in 1898 from pitchblende ore. It took her four years to isolate one gram of pure radium. After Pierre died in a road accident in 1906 she became the first female professor at the University of Paris. During World War One she developed mobile X-ray units called petites Curies and trained 150 women as radiological technicians. Over one million wounded soldiers were treated using her units. She died on 4 July 1934 from aplastic anaemia caused by radiation exposure. Her notebooks remain radioactive and are stored in lead-lined boxes. Correct answers for True False Not Given questions are: Statement 1 TRUE — she was first to win Nobel Prize twice. Statement 2 FALSE — she was born in Poland not France. Statement 3 TRUE — polonium named after her homeland Poland. Statement 4 FALSE — it took four years not less than two. Statement 5 FALSE — Pierre died in a road accident not laboratory accident. Statement 6 TRUE — she became first female professor at University of Paris. Statement 7 TRUE — over one million soldiers treated. Note completion answers are: Maria Sklodowska, University of Paris, 1895, pitchblende, X-ray.
  Passage 2 is about older workers in the modern workforce. In developed economies the proportion of workers aged 55 and over has risen due to increased life expectancy, changes to pension systems, and employer recognition of experienced worker value. A 2019 OECD study found older workers have lower absenteeism and stay longer with employers but may take longer to adapt to new technologies. The UK abolished default retirement age in 2011. Similar policies exist in Australia, Germany, and Japan. Critics say this disadvantages younger job seekers. Mentoring programmes and flexible working are effective retention strategies. Age discrimination in recruitment persists even when qualifications are equal. Correct answers for Multiple Choice are: Question 1 is B — a combination of several social and economic factors. Question 2 is B — had lower rates of workplace absence. Question 3 is C — statutory means legal. Question 4 is C — mentoring programmes and flexible arrangements. Question 5 is C — persists despite equal qualifications between age groups.

  WRITING KNOWLEDGE BANK:
  Use the following real IELTS writing tasks to generate Task 1 and Task 2 prompts.
  Task 1 prompt: The table shows the percentage of households with internet access in four countries between 2000 and 2020. UK went from 26 percent in 2000 to 96 percent in 2020. Germany went from 18 percent to 94 percent. Brazil went from 3 percent to 75 percent. India went from 0.5 percent to 50 percent. The student must summarise main features and make comparisons in at least 150 words. A band 8 answer describes all four countries, uses comparative language like rose sharply and remained stable, identifies the overall trend of growth across all nations, highlights the digital divide between developed and developing nations, and notes Brazil's dramatic relative growth and India still reaching only 50 percent by 2020.
  Task 2 prompt: Some people believe university education should be free for all students. Others argue students should pay their own tuition. Discuss both views and give your own opinion in at least 250 words. A strong band 7.5 answer has a clear introduction stating a position, body paragraph 1 arguing for free education with examples like Norway and Germany, body paragraph 2 arguing for student fees with the UK loan system as example, and a conclusion recommending a progressive means-tested hybrid system. Task 2 carries 67 percent of the total writing band and Task 1 carries 33 percent.

  SPEAKING KNOWLEDGE BANK:
  Use the following real IELTS speaking content to generate Part 1, Part 2, and Part 3 prompts.
  Part 1 topics are Hometown with questions about where the student is from, what they like about it, how it has changed, and whether they want to stay there. Studies and Work with questions about current studies or job, why they chose their field, and future plans. Free Time and Hobbies with questions about leisure activities, how long they have had that interest, indoor versus outdoor preference, and whether hobbies changed since childhood.
  Part 2 cue card: Describe a place you have visited that made a strong impression on you. The student should say where the place is and when they visited, what they did and saw there, why it made a strong impression, and whether they would like to return. One minute preparation time, then speak for one to two minutes.
  Part 3 discussion topics are Tourism and Travel with questions about why people enjoy visiting new places, how tourism has changed in your country, advantages and disadvantages of international tourism for local communities, whether mass tourism causes more harm than good, how travel might change due to climate change, and whether virtual tourism will ever replace real travel.

  You will also be provided with "Reference Knowledge" entries. Each entry may contain an "Admin Assigned Difficulty". 
  You MUST base the test around this knowledge AND try to match the test questions' difficulty to BOTH the TARGET STUDENT DIFFICULTY LEVEL and the Admin Assigned Difficulty of the knowledge.
  If the Admin Assigned Difficulty is different from the TARGET STUDENT DIFFICULTY LEVEL, blend them reasonably or lean towards the Student Difficulty Level.

  Mix and match randomly so that sometimes Listening comes from the furniture conversation, sometimes from Judy's research, sometimes from the learner persistence lecture, and sometimes from the custom Reference Knowledge. Reading questions can come from Marie Curie or Older Workers randomly. Always use the correct answers provided above when checking student responses for objective sections. Never reveal the correct answers to the student during the test. Only reveal them in the results screen after submission.

  You must apply the difficulty level strictly to every single question, every passage, every audio script, and every MCQ option you create throughout the test. Do not ignore it. Do not default to easy questions.

  Regarding difficulty level, ALL questions MUST be generated to be extremely tricky and hard with no obvious hints. This applies to all sections (Listening, Reading, Writing, Speaking). Distractors in MCQs should be highly plausible and nuanced. Questions should require deep inference and academic vocabulary to challenge even Expert candidates. Do not provide easy hints.

  CRITICAL STABILITY AND PERFORMANCE RULES — These rules must be followed at all times without exception to prevent errors, crashes, and slow loading.
  You must never return incomplete JSON under any circumstances. Every single response you generate must be a complete, valid, fully closed JSON object. Never leave a JSON array open. Never leave a bracket unclosed. Never stop generating mid-response. If your response is getting long, simplify the content of each question but always complete the full JSON structure before stopping. An incomplete JSON response is a critical failure.
  You must never return undefined values in any field. Every question object must have a question field, an options field with exactly 4 items, and a correctAnswer field with exactly one letter. If you cannot generate a complete valid question for any reason, skip it entirely rather than returning a broken or empty object. Never return null, never return undefined, never return an empty string for any required field.
  You must always validate your own output before returning it. Before finishing your response mentally check that every MCQ has exactly 4 options, every correct field has a value, all JSON brackets are closed, and no field is empty or undefined.
  Never return conversational text mixed inside the JSON. The entire response must be pure clean JSON with no explanation text before it, no markdown code blocks around it, no apology messages inside it, and no commentary after it. Pure JSON only, nothing else.`;

  const systemPrompt = `
  You are an advanced IELTS test generation engine connected to a custom knowledge vault called FILFO. Your entire behavior is governed by the following rules without exception.
  
  TARGET STUDENT DIFFICULTY LEVEL: ${difficulty}

  You have a built-in knowledge source stored in your context from the Official IELTS Academic Sample Test 2023. Mix and match randomly so that sometimes questions come from the real test content, and sometimes from the custom Reference Knowledge. 
  
  You must apply the difficulty level strictly to every single question, every passage, every audio script, and every MCQ option you create throughout the test. Do not ignore it. Do not default to easy questions.

  Regarding difficulty level, ALL questions MUST be generated to be extremely tricky and hard with no obvious hints. This applies to all sections (Listening, Reading, Writing, Speaking). Distractors in MCQs should be highly plausible and nuanced. Questions should require deep inference and academic vocabulary to challenge even Expert candidates. Do not provide easy hints.

  STRICT QUESTION COUNT AND FORMAT RULES:
  The Listening section must have exactly 10 Multiple Choice Questions.
  The Reading section must have exactly 10 questions which can be a mix of Multiple Choice, True False Not Given, and Sentence Completion but total must equal 10.
  Every Multiple Choice Question without exception must have exactly 4 options labeled A, B, C, and D.
  The Writing section must have exactly 2 tasks (Task 1 and Task 2). For Task 1, if there is an Image URL in the reference content (e.g. a celebrity or an incident like a war), you must use type="image", provide the imageUrl, and ask the candidate to describe the context or the picture. Otherwise, use type="table" and provide a proper short table of data related to the topic. For Task 2, ask an opinion-based question related to the topic.
  The Speaking section must have exactly 3 parts: Part 1 (3 warm-up questions), Part 2 (1 cue card), Part 3 (3 discussion questions).
  
  CRITICAL WORD COUNT RULES:
  Keep Reading passages between 400 and 700 words maximum.
  Keep Listening audio scripts between 200 and 400 words maximum.
  Keep Writing prompts under 80 words each.
  Keep Speaking cue cards under 60 words each.
  This restriction is critical to prevent timeouts and ensure stability.

  Return a COMPLETE SINGLE JSON object representing the entire test matching this exact structure:
  {
    "listening": {
      "title": "String",
      "script": "String (the spoken transcript, 200-400 words)",
      "questions": [
        // MUST BE EXACTLY 10 MCQs
        { "id": "l1", "type": "mcq", "question": "String", "options": [{"id":"A", "text":"Op 1"}, {"id":"B", "text":"Op 2"}, {"id":"C", "text":"Op 3"}, {"id":"D", "text":"Op 4"}], "correctAnswer": "A" }
      ]
    },
    "reading": {
      "title": "String",
      "passage": "String (the reading passage, 400-700 words)",
      "questions": [
        // MUST BE EXACTLY 10 QUESTIONS TOTAL
        { "id": "r1", "type": "mcq", "question": "String", "options": [{"id":"A", "text":"Op 1"}, {"id":"B", "text":"Op 2"}, {"id":"C", "text":"Op 3"}, {"id":"D", "text":"Op 4"}], "correctAnswer": "A" },
        { "id": "r2", "type": "tfng", "question": "String", "options": [{"id": "True", "text": "True"}, {"id": "False", "text": "False"}, {"id": "Not Given", "text": "Not Given"}], "correctAnswer": "True" },
        { "id": "r3", "type": "text", "label": "String", "correctAnswer": "Word" }
      ]
    },
    "writing": {
      "task1": {
        "title": "String",
        "description": "String (Detailed prompt, max 80 words)",
        "imageUrl": "Optional string (Include if you have an Image URL in your reference)",
        "data": { "Category1": 10, "Category2": 20 },
        "type": "table or image",
        "minWords": 150
      },
      "task2": {
        "prompt": "String (Essay prompt asking for opinions, max 80 words)",
        "minWords": 250
      }
    },
    "speaking": {
      "part1": ["Question 1", "Question 2", "Question 3"],
      "part2": { "cue": "Topic (max 60 words)", "points": ["Point 1", "Point 2", "Point 3", "Point 4"] },
      "part3": ["Question 1", "Question 2", "Question 3"]
    }
  }
  `;

  const inputContent = finalRefs.length > 0 
    ? `Please generate a full complete IELTS test based heavily on the following knowledge:\n\n${finalRefs.join('\n\n')}`
    : `Please generate a full complete IELTS test on a surprise, random topic.`;

  const { realTestLibrary } = await import('../data/realTestLibrary');
  const fallback = realTestLibrary[10] || realTestLibrary[0];

  onProgress && onProgress("Generating full test (Listening, Reading, Writing, Speaking)...", 50);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const responseText = await Promise.race([
        getAiClient().models.generateContent({
          model: "gemini-2.5-flash",
          contents: inputContent,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.7
          }
        }).then(res => res.text),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 90000)) // 90 seconds timeout for full test
      ]);

      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          if (Object.keys(parsed).length > 0) {
            return {
              difficulty,
              listening: parsed.listening,
              reading: parsed.reading,
              writing: parsed.writing,
              speaking: parsed.speaking
            };
          }
        } catch(e) {
          console.error("Failed to parse JSON response:", e);
        }
      }
    } catch (e: any) {
      console.error(`Attempt ${attempt} failed:`, e);
      
      // If quota exceeded or rate limited, don't bother retrying
      if (e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('RESOURCE_EXHAUSTED') || e?.message?.includes('quota')) {
        console.warn("API quota exceeded. Falling back to library test.");
        break;
      }

      if (attempt === 2) {
         console.warn("Test generation failed. Falling back to library test.");
         break;
      }
    }
  }

  // If all attempts failed, use fallback
  return {
    difficulty,
    listening: fallback.listening,
    reading: fallback.reading,
    writing: fallback.writing,
    speaking: fallback.speaking
  };
}

