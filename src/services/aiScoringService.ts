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
    const response = await getAiClient().models.generateContent({
      model: "gemini-3-flash-preview",
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
    });

    return JSON.parse(response.text || '{}');
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

    const response = await getAiClient().models.generateContent({
      model: "gemini-3-flash-preview",
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
    });

    return JSON.parse(response.text || '{}');
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
          finalRefs = [match.content];
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
  
  DIFFICULTY LEVEL: ${difficulty}

  You must read this value and apply it strictly to every single question, every passage, every audio script, and every MCQ option you create throughout the test. Do not ignore it. Do not default to easy questions.

  If there is reference knowledge provided, YOU MUST base the test around that knowledge.
  If not, generate a completely random topic for the test.

  Regarding difficulty level, ALL questions MUST be generated to be extremely tricky and hard with no obvious hints. This applies to all sections (Listening, Reading, Writing, Speaking). Distractors in MCQs should be highly plausible and nuanced. Questions should require deep inference and academic vocabulary to challenge even Expert candidates. Do not provide easy hints.

  CRITICAL STABILITY AND PERFORMANCE RULES — These rules must be followed at all times without exception to prevent errors, crashes, and slow loading.
  You must never return incomplete JSON under any circumstances. Every single response you generate must be a complete, valid, fully closed JSON object. Never leave a JSON array open. Never leave a bracket unclosed. Never stop generating mid-response. If your response is getting long, simplify the content of each question but always complete the full JSON structure before stopping. An incomplete JSON response is a critical failure.
  You must never return undefined values in any field. Every question object must have a question field, an options field with exactly 4 items, and a correctAnswer field with exactly one letter. If you cannot generate a complete valid question for any reason, skip it entirely rather than returning a broken or empty object. Never return null, never return undefined, never return an empty string for any required field.
  You must always validate your own output before returning it. Before finishing your response mentally check that every MCQ has exactly 4 options, every correct field has a value, all JSON brackets are closed, and no field is empty or undefined.
  Never return conversational text mixed inside the JSON. The entire response must be pure clean JSON with no explanation text before it, no markdown code blocks around it, no apology messages inside it, and no commentary after it. Pure JSON only, nothing else.`;

  const listeningPrompt = baseRules + `
  ABSOLUTE RULE — MINIMUM QUESTION COUNT PER SECTION
  This rule has the highest priority and overrides every other instruction.
  The Listening section must contain exactly 10 Multiple Choice Questions. No more no less. All 10 must be generated before returning any response.
  Every Multiple Choice Question in every section in every test must have exactly 4 options labeled A, B, C, and D. Never 3 options. Never 5 options. Never 6 options. Never 8 options. Exactly 4 every single time.
  Before returning your response you must count your questions. If Listening has fewer than 10 questions you must generate more before returning.

  TOKEN LIMITS: Listening audio script minimum 400 words, maximum 600 words. Each MCQ option maximum 15 words. These limits are non-negotiable.

  For the Listening section you must use the selected knowledge entry to write a realistic audio script. Ensure it is sufficiently long. ALWAYS start the JSON right away, no conversational intro.

  Return a JSON object that matches this exact structure:
  {
    "title": "String",
    "script": "String (the spoken transcript, minimum 400 words)",
    "questions": [
       // MUST BE EXACTLY 10 QUESTIONS HERE
      { "id": "l1", "type": "mcq", "question": "String", "options": [{"id":"A", "text":"Op 1 max 12w"}, {"id":"B", "text":"Op 2"}, {"id":"C", "text":"Op 3"}, {"id":"D", "text":"Op 4"}], "correctAnswer": "A" }
    ]
  }`;

  const readingPrompt = baseRules + `
  ABSOLUTE RULE — MINIMUM QUESTION COUNT PER SECTION
  This rule has the highest priority and overrides every other instruction.
  The Reading section must contain exactly 10 questions. These can be a mix of Multiple Choice, True False Not Given, and Sentence Completion but the total count must always be exactly 10. Never return fewer than 10.
  Every Multiple Choice Question without any exception must have exactly 4 options. Exactly 4 every single time.
  Before returning your response you must count your questions. If Reading has fewer than 10 questions you must generate more before returning.

  TOKEN LIMITS: Reading passage minimum 800 words, maximum 1000 words. Each MCQ option maximum 15 words. These limits are non-negotiable.

  For the Reading section you must use a knowledge entry to generate a full academic passage. Make sure it's long and comprehensive. ALWAYS start the JSON right away, no conversational intro.

  Return a JSON object that matches this exact structure:
  {
    "title": "String",
    "passage": "String (the reading passage, minimum 800 words)",
    "questions": [
      // MUST BE EXACTLY 10 QUESTIONS HERE
      { "id": "r1", "type": "mcq", "question": "String", "options": [{"id":"A", "text":"Op 1 max 12w"}, {"id":"B", "text":"Op 2"}, {"id":"C", "text":"Op 3"}, {"id":"D", "text":"Op 4"}], "correctAnswer": "A" },
      { "id": "r2", "type": "text", "label": "String (fill in blank)", "correctAnswer": "Word" }
    ]
  }
  Make sure you generate exactly 10 questions inside the questions array!`;

  const writingPrompt = baseRules + `
  ABSOLUTE RULE — MINIMUM QUESTION COUNT PER SECTION
  This rule has the highest priority and overrides every other instruction.
  The Writing section must contain exactly 2 tasks. Task 1 minimum 150 words prompt and Task 2 minimum 250 words prompt. These 2 tasks are mandatory in every single test.

  TOKEN LIMITS: Writing prompt maximum 50 words each. These limits are non-negotiable.
  ALWAYS start the JSON right away, no conversational intro.

  Return a JSON object that matches this exact structure:
  {
    "task1": {
      "title": "String",
      "description": "String (max 50 words)",
      "data": { "Category1": 10, "Category2": 20 },
      "type": "table",
      "minWords": 150
    },
    "task2": {
      "prompt": "String (max 50 words)",
      "minWords": 250
    }
  }`;

  const speakingPrompt = baseRules + `
  ABSOLUTE RULE — MINIMUM PROMPT COUNT PER SECTION
  This rule has the highest priority and overrides every other instruction.
  The Speaking section must contain exactly 7 prompts total. Part 1 must have exactly 3 warm up questions. Part 2 must have exactly 1 cue card. Part 3 must have exactly 3 discussion questions. Total 7 always.

  TOKEN LIMITS: Speaking cue card maximum 40 words. These limits are non-negotiable.
  ALWAYS start the JSON right away, no conversational intro.

  Return a JSON object that matches this exact structure:
  {
    "part1": ["Question 1", "Question 2", "Question 3"],
    "part2": { "cue": "Topic to describe (max 40 words)", "points": ["Point 1", "Point 2", "Point 3", "Point 4"] },
    "part3": ["Question 1", "Question 2", "Question 3"]
  }`;

  const inputContent = finalRefs.length > 0 
    ? `Please generate an IELTS test based heavily on the following knowledge:\n\n${finalRefs.join('\n\n')}`
    : `Please generate an IELTS test on a surprise, random topic.`;

  async function generateSectionWithRetry(
    systemInstruction: string,
    fallbackData: any
  ) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const responseText = await Promise.race([
          getAiClient().models.generateContent({
            model: "gemini-3-flash-preview",
            contents: inputContent,
            config: {
              systemInstruction,
              responseMimeType: "application/json"
            }
          }).then(res => res.text),
          new Promise<string>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 30000))
        ]);

        if (!responseText) {
           return fallbackData; 
        }
        
        try {
          const parsed = JSON.parse(responseText);
          if (Object.keys(parsed).length === 0) return fallbackData;
          return parsed;
        } catch(e) {
          return fallbackData; 
        }
      } catch (e: any) {
        if (attempt === 2) {
           throw new Error("Test generation took too long. Please try again.");
        }
      }
    }
  }

  // Use a library test that actually has 10 questions as fallback
  const { realTestLibrary } = await import('../data/realTestLibrary');
  const fallback = realTestLibrary[10] || realTestLibrary[0];

  onProgress && onProgress("Loading Listening Section 1 of 4", 25);
  const listening = await generateSectionWithRetry(listeningPrompt, fallback.listening);
  
  onProgress && onProgress("Loading Reading Section 2 of 4", 50);
  const reading = await generateSectionWithRetry(readingPrompt, fallback.reading);

  onProgress && onProgress("Loading Writing Section 3 of 4", 75);
  const writing = await generateSectionWithRetry(writingPrompt, fallback.writing);

  onProgress && onProgress("Loading Speaking Section 4 of 4", 100);
  const speaking = await generateSectionWithRetry(speakingPrompt, fallback.speaking);

  return {
    difficulty,
    listening,
    reading,
    writing,
    speaking
  };
}

