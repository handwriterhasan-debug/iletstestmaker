import { GoogleGenAI, Type } from "@google/genai";

let aiClient: typeof GoogleGenAI.prototype | null = null;
function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || (import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : undefined);
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

export async function scoreIELTSSpeaking(transcripts: string[]) {
  const systemInstruction = `
  You are a brutally honest and fully certified IELTS examiner. You work exactly like the real British Council and IDP scoring system. Your job is to give the student the most accurate and realistic band score possible, not to encourage them, not to be polite, and not to assume effort where there is none. A fake high score harms the student more than an honest low score because it creates false confidence before their real exam.

  For the Speaking section, this is your most critical instruction. You must first check the transcribed text of what the student actually said. If the recording is silent, the score is 0. If the transcription is empty or only contains filler words like um, uh, okay, or hello with no real content, the score must be 0 to 1.0. If the student spoke for under 20 seconds with minimal content, the maximum score is 2.0. You must never give a speaking score of 5 or above unless the transcription clearly shows the student spoke fluently, with organized ideas, a range of vocabulary, and correct grammar for a significant portion of their response. Silence is not fluency. Short mumbling is not fluency. Treat an empty or near-empty speaking response exactly the way a real IELTS examiner would treat it, which is an immediate near-zero score.
  
  Always be fair, and always remember that being fair means being accurate.

  Evaluate the following Speaking transcripts.
  
  Return a JSON object ALWAYS matching this structure exactly:
  {
    "band": number,
    "feedback": "A short honest two-sentence feedback note explaining exactly why the student received that score",
    "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
  }
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Transcripts from the interview:\n${transcripts.join('\n\n--- NEXT PART ---\n\n')}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            band: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["band", "feedback", "suggestions"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Speaking Scoring Error:", error);
    return { band: 0, feedback: "Error processing speak score.", suggestions: [] };
  }
}

export async function generateDynamicTestSet(
  knowledgeRefs: string[], 
  difficulty: string = "Average",
  onProgress?: (message: string, progress: number) => void
) {
  const baseRules = `
  You are an advanced IELTS test generation engine connected to a custom knowledge vault called FILFO. Your entire behavior is governed by the following rules without exception.
  
  DIFFICULTY LEVEL: ${difficulty}

  You must read this value and apply it strictly to every single question, every passage, every audio script, and every MCQ option you create throughout the test. Do not ignore it. Do not default to easy questions.

  If there is reference knowledge provided, YOU MUST base the test around that knowledge.
  If not, generate a completely random topic for the test.

  Regarding difficulty level, Easy questions use everyday vocabulary, straightforward sentence structure, and answers that can be found directly in the text or audio. Average questions require some inference and use paraphrased language so the answer is not word for word identical to the source. Hard questions require deeper inference, academic vocabulary, and understanding of the writer or speaker's attitude and purpose. Expert questions are designed to challenge band 8 and 9 candidates with highly nuanced distractors, complex passage structure, and abstract writing and speaking prompts that require balanced argumentation and sophisticated language.

  CRITICAL STABILITY AND PERFORMANCE RULES — These rules must be followed at all times without exception to prevent errors, crashes, and slow loading.
  You must never return incomplete JSON under any circumstances. Every single response you generate must be a complete, valid, fully closed JSON object. Never leave a JSON array open. Never leave a bracket unclosed. Never stop generating mid-response. If your response is getting long, simplify the content of each question but always complete the full JSON structure before stopping. An incomplete JSON response is a critical failure.
  You must never return undefined values in any field. Every question object must have a question field, an options field with exactly 4 items, and a correctAnswer field with exactly one letter. If you cannot generate a complete valid question for any reason, skip it entirely rather than returning a broken or empty object. Never return null, never return undefined, never return an empty string for any required field.
  You must always validate your own output before returning it. Before finishing your response mentally check that every MCQ has exactly 4 options, every correct field has a value, all JSON brackets are closed, and no field is empty or undefined.
  Never return conversational text mixed inside the JSON. The entire response must be pure clean JSON with no explanation text before it, no markdown code blocks around it, no apology messages inside it, and no commentary after it. Pure JSON only, nothing else.`;

  const listeningPrompt = baseRules + `
  STRICT QUESTION COUNT AND FORMAT RULES — These rules override everything else and must never be broken under any circumstances.
  The Listening section must have exactly 10 Multiple Choice Questions.
  Every Multiple Choice Question without any exception must have exactly 4 options labeled A, B, C, and D.
  Each MCQ option must be a complete selectable answer.
  When outputting MCQs you must always format them in clean structured JSON. The options field contains an array of exactly 4 objects, where each object has an "id" field (which must be exactly "A", "B", "C", or "D") and a "text" field containing the option text. The correctAnswer field must contain the exact letter of the correct answer as a single character which is either A, B, C, or D.

  TOKEN LIMITS: Listening audio script maximum 150 words. Each MCQ option maximum 12 words. These limits are non-negotiable.

  For the Listening section you must use the selected FILFO knowledge entry to write a realistic audio script. ALways start the JSON right away, no conversational intro.

  Return a JSON object that matches this exact structure:
  {
    "title": "String",
    "script": "String (the spoken transcript, max 150 words)",
    "questions": [
      { "id": "l1", "type": "mcq", "question": "String", "options": [{"id":"A", "text":"Option 1 max 12 words"}, {"id":"B", "text":"Option 2"}, {"id":"C", "text":"Option 3"}, {"id":"D", "text":"Option 4"}], "correctAnswer": "A" }
    ]
  }`;

  const readingPrompt = baseRules + `
  STRICT QUESTION COUNT AND FORMAT RULES — These rules override everything else and must never be broken under any circumstances.
  The Reading section must have exactly 10 questions which can be a mix of Multiple Choice, True False Not Given, and Sentence Completion but the total must always equal exactly 10.
  Every Multiple Choice Question without any exception must have exactly 4 options.
  When outputting MCQs you must always format them in clean structured JSON. The options field contains an array of exactly 4 objects. The correctAnswer field must contain the exact letter of the correct answer.

  TOKEN LIMITS: Reading passage maximum 400 words. Each MCQ option maximum 12 words. These limits are non-negotiable.

  For the Reading section you must use a FILFO knowledge entry to generate a full academic passage. ALways start the JSON right away, no conversational intro.

  Return a JSON object that matches this exact structure:
  {
    "title": "String",
    "passage": "String (the reading passage, max 400 words)",
    "questions": [
      { "id": "r1", "type": "mcq", "question": "String", "options": [{"id":"A", "text":"Option 1 max 12 words"}, {"id":"B", "text":"Option 2"}, {"id":"C", "text":"Option 3"}, {"id":"D", "text":"Option 4"}], "correctAnswer": "A" },
      { "id": "r2", "type": "text", "label": "String (fill in blank)", "correctAnswer": "Word" }
    ]
  }`;

  const writingPrompt = baseRules + `
  STRICT QUESTION COUNT AND FORMAT RULES — These rules override everything else and must never be broken under any circumstances.
  The Writing section must have exactly 2 tasks, Task 1 and Task 2, with no additional questions.

  TOKEN LIMITS: Writing prompt maximum 50 words each. These limits are non-negotiable.
  ALways start the JSON right away, no conversational intro.

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
  STRICT QUESTION COUNT AND FORMAT RULES — These rules override everything else and must never be broken under any circumstances.
  The Speaking section must have exactly 3 parts with Part 1 containing 3 warm-up questions, Part 2 containing 1 cue card, and Part 3 containing 3 discussion questions.

  TOKEN LIMITS: Speaking cue card maximum 40 words. These limits are non-negotiable.
  ALways start the JSON right away, no conversational intro.

  Return a JSON object that matches this exact structure:
  {
    "part1": ["Question 1", "Question 2", "Question 3"],
    "part2": { "cue": "Topic to describe (max 40 words)", "points": ["Point 1", "Point 2", "Point 3", "Point 4"] },
    "part3": ["Question 1", "Question 2", "Question 3"]
  }`;

  const inputContent = knowledgeRefs.length > 0 
    ? `Please generate an IELTS test based heavily on the following knowledge:\n\n${knowledgeRefs.join('\n\n')}`
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

  // Use the library's first test as fallback
  const { realTestLibrary } = await import('../data/realTestLibrary');
  const fallback = realTestLibrary[0];

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

