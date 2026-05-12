
export interface RealTestSet {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  listening: {
    title: string;
    script: string;
    questions: any[];
  };
  reading: {
    title: string;
    passage: string;
    questions: any[];
  };
  writing: {
    task1: any;
    task2: any;
  };
  speaking: {
    part1: string[];
    part2: { cue: string; points: string[] };
    part3: string[];
  };
}

export const realTestLibrary: RealTestSet[] = [
  {
    difficulty: 'Hard',
    listening: {
      title: "Technology & AI - Listening",
      script: "Welcome to the lecture on Technology & AI. Today we will discuss its profound impact on society. Firstly, we must look at the overall effect. The statistics from 2024 show a 35% increase in relevant metrics. Furthermore, it is essential to consider the historical context dating back to 1990. Thank you for your attention.",
      questions: [
        { id: 'new6l1', question: "What is the topic?", type: 'mcq', options: [{id:'A',text:'Technology & AI'}, {id:'B',text:'Math'}, {id:'C',text:'Science'}, {id:'D',text:'Art'}], correctAnswer: 'A' },
        { id: 'new6l2', label: "Percentage increase: ___%", type: 'text', correctAnswer: "35" },
        { id: 'new6l3', label: "Historical year mentioned: ___", type: 'text', correctAnswer: "1990" },
        { id: 'new6l4', question: "Was the lecture about Technology & AI?", type: 'mcq', options: [{id:'A',text:'Yes'}, {id:'B',text:'No'}], correctAnswer: 'A' }
      ]
    },
    reading: {
      title: "Understanding Technology & AI",
      passage: "Technology & AI has drastically transformed how we live, work, and interact. Various studies highlight both positive and negative consequences. A key benefit is increased efficiency and connectivity, while the main drawback remains the steep learning curve and environmental cost. Experts suggest that by 2050, the integration of related systems will be absolute.",
      questions: [
        { id: 'new6r1', label: "Technology & AI has transformed how we live.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'new6r2', label: "By ____, the integration will be absolute.", type: 'text', correctAnswer: "2050" },
        { id: 'new6r3', question: "What is the main drawback?", type: 'mcq', options: [{id:'A',text:'Cost'}, {id:'B',text:'Steep learning curve'}, {id:'C',text:'No drawbacks'}, {id:'D',text:'Time'}], correctAnswer: 'B' },
        { id: 'new6r4', label: "Efficiency is a negative consequence.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'new6r5', label: "There are both positive and negative consequences.", type: 'tfng', correctAnswer: 'TRUE' }
      ]
    },
    writing: {
      task1: {
        type: 'bar',
        title: "Growth of Technology & AI 2010-2024",
        data: {
          NorthAmerica: [100, 150, 200, 250],
          Europe: [80, 130, 180, 220]
        },
        minWords: 150
      },
      task2: {
        prompt: "Some believe that Technology & AI will ultimately solve all humanity's problems. To what extent do you agree or disagree?",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Do you know much about Technology & AI?", "Is it popular in your country?"],
      part2: {
        cue: "Describe a time you learned about Technology & AI.",
        points: ["When was it?", "Who taught you?", "How did you feel?"]
      },
      part3: ["How will Technology & AI evolve in the future?"]
    }
  },
  {
    difficulty: 'Medium',
    listening: {
      title: "Global Warming - Listening",
      script: "Welcome to the lecture on Global Warming. Today we will discuss its profound impact on society. Firstly, we must look at the overall effect. The statistics from 2024 show a 35% increase in relevant metrics. Furthermore, it is essential to consider the historical context dating back to 1990. Thank you for your attention.",
      questions: [
        { id: 'new7l1', question: "What is the topic?", type: 'mcq', options: [{id:'A',text:'Global Warming'}, {id:'B',text:'Math'}, {id:'C',text:'Science'}, {id:'D',text:'Art'}], correctAnswer: 'A' },
        { id: 'new7l2', label: "Percentage increase: ___%", type: 'text', correctAnswer: "35" },
        { id: 'new7l3', label: "Historical year mentioned: ___", type: 'text', correctAnswer: "1990" },
        { id: 'new7l4', question: "Was the lecture about Global Warming?", type: 'mcq', options: [{id:'A',text:'Yes'}, {id:'B',text:'No'}], correctAnswer: 'A' }
      ]
    },
    reading: {
      title: "Understanding Global Warming",
      passage: "Global Warming has drastically transformed how we live, work, and interact. Various studies highlight both positive and negative consequences. A key benefit is increased efficiency and connectivity, while the main drawback remains the steep learning curve and environmental cost. Experts suggest that by 2050, the integration of related systems will be absolute.",
      questions: [
        { id: 'new7r1', label: "Global Warming has transformed how we live.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'new7r2', label: "By ____, the integration will be absolute.", type: 'text', correctAnswer: "2050" },
        { id: 'new7r3', question: "What is the main drawback?", type: 'mcq', options: [{id:'A',text:'Cost'}, {id:'B',text:'Steep learning curve'}, {id:'C',text:'No drawbacks'}, {id:'D',text:'Time'}], correctAnswer: 'B' },
        { id: 'new7r4', label: "Efficiency is a negative consequence.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'new7r5', label: "There are both positive and negative consequences.", type: 'tfng', correctAnswer: 'TRUE' }
      ]
    },
    writing: {
      task1: {
        type: 'bar',
        title: "Growth of Global Warming 2010-2024",
        data: {
          NorthAmerica: [100, 150, 200, 250],
          Europe: [80, 130, 180, 220]
        },
        minWords: 150
      },
      task2: {
        prompt: "Some believe that Global Warming will ultimately solve all humanity's problems. To what extent do you agree or disagree?",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Do you know much about Global Warming?", "Is it popular in your country?"],
      part2: {
        cue: "Describe a time you learned about Global Warming.",
        points: ["When was it?", "Who taught you?", "How did you feel?"]
      },
      part3: ["How will Global Warming evolve in the future?"]
    }
  },
  {
    difficulty: 'Easy',
    listening: {
      title: "Internet & Social Media - Listening",
      script: "Welcome to the lecture on Internet & Social Media. Today we will discuss its profound impact on society. Firstly, we must look at the overall effect. The statistics from 2024 show a 35% increase in relevant metrics. Furthermore, it is essential to consider the historical context dating back to 1990. Thank you for your attention.",
      questions: [
        { id: 'new8l1', question: "What is the topic?", type: 'mcq', options: [{id:'A',text:'Internet & Social Media'}, {id:'B',text:'Math'}, {id:'C',text:'Science'}, {id:'D',text:'Art'}], correctAnswer: 'A' },
        { id: 'new8l2', label: "Percentage increase: ___%", type: 'text', correctAnswer: "35" },
        { id: 'new8l3', label: "Historical year mentioned: ___", type: 'text', correctAnswer: "1990" },
        { id: 'new8l4', question: "Was the lecture about Internet & Social Media?", type: 'mcq', options: [{id:'A',text:'Yes'}, {id:'B',text:'No'}], correctAnswer: 'A' }
      ]
    },
    reading: {
      title: "Understanding Internet & Social Media",
      passage: "Internet & Social Media has drastically transformed how we live, work, and interact. Various studies highlight both positive and negative consequences. A key benefit is increased efficiency and connectivity, while the main drawback remains the steep learning curve and environmental cost. Experts suggest that by 2050, the integration of related systems will be absolute.",
      questions: [
        { id: 'new8r1', label: "Internet & Social Media has transformed how we live.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'new8r2', label: "By ____, the integration will be absolute.", type: 'text', correctAnswer: "2050" },
        { id: 'new8r3', question: "What is the main drawback?", type: 'mcq', options: [{id:'A',text:'Cost'}, {id:'B',text:'Steep learning curve'}, {id:'C',text:'No drawbacks'}, {id:'D',text:'Time'}], correctAnswer: 'B' },
        { id: 'new8r4', label: "Efficiency is a negative consequence.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'new8r5', label: "There are both positive and negative consequences.", type: 'tfng', correctAnswer: 'TRUE' }
      ]
    },
    writing: {
      task1: {
        type: 'bar',
        title: "Growth of Internet & Social Media 2010-2024",
        data: {
          NorthAmerica: [100, 150, 200, 250],
          Europe: [80, 130, 180, 220]
        },
        minWords: 150
      },
      task2: {
        prompt: "Some believe that Internet & Social Media will ultimately solve all humanity's problems. To what extent do you agree or disagree?",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Do you know much about Internet & Social Media?", "Is it popular in your country?"],
      part2: {
        cue: "Describe a time you learned about Internet & Social Media.",
        points: ["When was it?", "Who taught you?", "How did you feel?"]
      },
      part3: ["How will Internet & Social Media evolve in the future?"]
    }
  },
  {
    difficulty: 'Easy',
    listening: {
      title: "Daily Routine - Listening",
      script: "Welcome to the lecture on Daily Routine. Today we will discuss its profound impact on society. Firstly, we must look at the overall effect. The statistics from 2024 show a 35% increase in relevant metrics. Furthermore, it is essential to consider the historical context dating back to 1990. Thank you for your attention.",
      questions: [
        { id: 'new9l1', question: "What is the topic?", type: 'mcq', options: [{id:'A',text:'Daily Routine'}, {id:'B',text:'Math'}, {id:'C',text:'Science'}, {id:'D',text:'Art'}], correctAnswer: 'A' },
        { id: 'new9l2', label: "Percentage increase: ___%", type: 'text', correctAnswer: "35" },
        { id: 'new9l3', label: "Historical year mentioned: ___", type: 'text', correctAnswer: "1990" },
        { id: 'new9l4', question: "Was the lecture about Daily Routine?", type: 'mcq', options: [{id:'A',text:'Yes'}, {id:'B',text:'No'}], correctAnswer: 'A' }
      ]
    },
    reading: {
      title: "Understanding Daily Routine",
      passage: "Daily Routine has drastically transformed how we live, work, and interact. Various studies highlight both positive and negative consequences. A key benefit is increased efficiency and connectivity, while the main drawback remains the steep learning curve and environmental cost. Experts suggest that by 2050, the integration of related systems will be absolute.",
      questions: [
        { id: 'new9r1', label: "Daily Routine has transformed how we live.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'new9r2', label: "By ____, the integration will be absolute.", type: 'text', correctAnswer: "2050" },
        { id: 'new9r3', question: "What is the main drawback?", type: 'mcq', options: [{id:'A',text:'Cost'}, {id:'B',text:'Steep learning curve'}, {id:'C',text:'No drawbacks'}, {id:'D',text:'Time'}], correctAnswer: 'B' },
        { id: 'new9r4', label: "Efficiency is a negative consequence.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'new9r5', label: "There are both positive and negative consequences.", type: 'tfng', correctAnswer: 'TRUE' }
      ]
    },
    writing: {
      task1: {
        type: 'bar',
        title: "Growth of Daily Routine 2010-2024",
        data: {
          NorthAmerica: [100, 150, 200, 250],
          Europe: [80, 130, 180, 220]
        },
        minWords: 150
      },
      task2: {
        prompt: "Some believe that Daily Routine will ultimately solve all humanity's problems. To what extent do you agree or disagree?",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Do you know much about Daily Routine?", "Is it popular in your country?"],
      part2: {
        cue: "Describe a time you learned about Daily Routine.",
        points: ["When was it?", "Who taught you?", "How did you feel?"]
      },
      part3: ["How will Daily Routine evolve in the future?"]
    }
  },
  {
    difficulty: 'Hard',
    listening: {
      title: "Space Exploration - Listening",
      script: "Welcome to the lecture on Space Exploration. Today we will discuss its profound impact on society. Firstly, we must look at the overall effect. The statistics from 2024 show a 35% increase in relevant metrics. Furthermore, it is essential to consider the historical context dating back to 1990. Thank you for your attention.",
      questions: [
        { id: 'new10l1', question: "What is the topic?", type: 'mcq', options: [{id:'A',text:'Space Exploration'}, {id:'B',text:'Math'}, {id:'C',text:'Science'}, {id:'D',text:'Art'}], correctAnswer: 'A' },
        { id: 'new10l2', label: "Percentage increase: ___%", type: 'text', correctAnswer: "35" },
        { id: 'new10l3', label: "Historical year mentioned: ___", type: 'text', correctAnswer: "1990" },
        { id: 'new10l4', question: "Was the lecture about Space Exploration?", type: 'mcq', options: [{id:'A',text:'Yes'}, {id:'B',text:'No'}], correctAnswer: 'A' }
      ]
    },
    reading: {
      title: "Understanding Space Exploration",
      passage: "Space Exploration has drastically transformed how we live, work, and interact. Various studies highlight both positive and negative consequences. A key benefit is increased efficiency and connectivity, while the main drawback remains the steep learning curve and environmental cost. Experts suggest that by 2050, the integration of related systems will be absolute.",
      questions: [
        { id: 'new10r1', label: "Space Exploration has transformed how we live.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'new10r2', label: "By ____, the integration will be absolute.", type: 'text', correctAnswer: "2050" },
        { id: 'new10r3', question: "What is the main drawback?", type: 'mcq', options: [{id:'A',text:'Cost'}, {id:'B',text:'Steep learning curve'}, {id:'C',text:'No drawbacks'}, {id:'D',text:'Time'}], correctAnswer: 'B' },
        { id: 'new10r4', label: "Efficiency is a negative consequence.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'new10r5', label: "There are both positive and negative consequences.", type: 'tfng', correctAnswer: 'TRUE' }
      ]
    },
    writing: {
      task1: {
        type: 'bar',
        title: "Growth of Space Exploration 2010-2024",
        data: {
          NorthAmerica: [100, 150, 200, 250],
          Europe: [80, 130, 180, 220]
        },
        minWords: 150
      },
      task2: {
        prompt: "Some believe that Space Exploration will ultimately solve all humanity's problems. To what extent do you agree or disagree?",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Do you know much about Space Exploration?", "Is it popular in your country?"],
      part2: {
        cue: "Describe a time you learned about Space Exploration.",
        points: ["When was it?", "Who taught you?", "How did you feel?"]
      },
      part3: ["How will Space Exploration evolve in the future?"]
    }
  },
  {
    difficulty: 'Medium',
    listening: {
      title: "Modern Healthcare - Listening",
      script: "Welcome to the lecture on Modern Healthcare. Today we will discuss its profound impact on society. Firstly, we must look at the overall effect. The statistics from 2024 show a 35% increase in relevant metrics. Furthermore, it is essential to consider the historical context dating back to 1990. Thank you for your attention.",
      questions: [
        { id: 'new11l1', question: "What is the topic?", type: 'mcq', options: [{id:'A',text:'Modern Healthcare'}, {id:'B',text:'Math'}, {id:'C',text:'Science'}, {id:'D',text:'Art'}], correctAnswer: 'A' },
        { id: 'new11l2', label: "Percentage increase: ___%", type: 'text', correctAnswer: "35" },
        { id: 'new11l3', label: "Historical year mentioned: ___", type: 'text', correctAnswer: "1990" },
        { id: 'new11l4', question: "Was the lecture about Modern Healthcare?", type: 'mcq', options: [{id:'A',text:'Yes'}, {id:'B',text:'No'}], correctAnswer: 'A' }
      ]
    },
    reading: {
      title: "Understanding Modern Healthcare",
      passage: "Modern Healthcare has drastically transformed how we live, work, and interact. Various studies highlight both positive and negative consequences. A key benefit is increased efficiency and connectivity, while the main drawback remains the steep learning curve and environmental cost. Experts suggest that by 2050, the integration of related systems will be absolute.",
      questions: [
        { id: 'new11r1', label: "Modern Healthcare has transformed how we live.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'new11r2', label: "By ____, the integration will be absolute.", type: 'text', correctAnswer: "2050" },
        { id: 'new11r3', question: "What is the main drawback?", type: 'mcq', options: [{id:'A',text:'Cost'}, {id:'B',text:'Steep learning curve'}, {id:'C',text:'No drawbacks'}, {id:'D',text:'Time'}], correctAnswer: 'B' },
        { id: 'new11r4', label: "Efficiency is a negative consequence.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'new11r5', label: "There are both positive and negative consequences.", type: 'tfng', correctAnswer: 'TRUE' }
      ]
    },
    writing: {
      task1: {
        type: 'bar',
        title: "Growth of Modern Healthcare 2010-2024",
        data: {
          NorthAmerica: [100, 150, 200, 250],
          Europe: [80, 130, 180, 220]
        },
        minWords: 150
      },
      task2: {
        prompt: "Some believe that Modern Healthcare will ultimately solve all humanity's problems. To what extent do you agree or disagree?",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Do you know much about Modern Healthcare?", "Is it popular in your country?"],
      part2: {
        cue: "Describe a time you learned about Modern Healthcare.",
        points: ["When was it?", "Who taught you?", "How did you feel?"]
      },
      part3: ["How will Modern Healthcare evolve in the future?"]
    }
  },
  {
    difficulty: 'Hard',
    listening: {
      title: "History of Trade - Listening",
      script: "Welcome to the lecture on History of Trade. Today we will discuss its profound impact on society. Firstly, we must look at the overall effect. The statistics from 2024 show a 35% increase in relevant metrics. Furthermore, it is essential to consider the historical context dating back to 1990. Thank you for your attention.",
      questions: [
        { id: 'new12l1', question: "What is the topic?", type: 'mcq', options: [{id:'A',text:'History of Trade'}, {id:'B',text:'Math'}, {id:'C',text:'Science'}, {id:'D',text:'Art'}], correctAnswer: 'A' },
        { id: 'new12l2', label: "Percentage increase: ___%", type: 'text', correctAnswer: "35" },
        { id: 'new12l3', label: "Historical year mentioned: ___", type: 'text', correctAnswer: "1990" },
        { id: 'new12l4', question: "Was the lecture about History of Trade?", type: 'mcq', options: [{id:'A',text:'Yes'}, {id:'B',text:'No'}], correctAnswer: 'A' }
      ]
    },
    reading: {
      title: "Understanding History of Trade",
      passage: "History of Trade has drastically transformed how we live, work, and interact. Various studies highlight both positive and negative consequences. A key benefit is increased efficiency and connectivity, while the main drawback remains the steep learning curve and environmental cost. Experts suggest that by 2050, the integration of related systems will be absolute.",
      questions: [
        { id: 'new12r1', label: "History of Trade has transformed how we live.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'new12r2', label: "By ____, the integration will be absolute.", type: 'text', correctAnswer: "2050" },
        { id: 'new12r3', question: "What is the main drawback?", type: 'mcq', options: [{id:'A',text:'Cost'}, {id:'B',text:'Steep learning curve'}, {id:'C',text:'No drawbacks'}, {id:'D',text:'Time'}], correctAnswer: 'B' },
        { id: 'new12r4', label: "Efficiency is a negative consequence.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'new12r5', label: "There are both positive and negative consequences.", type: 'tfng', correctAnswer: 'TRUE' }
      ]
    },
    writing: {
      task1: {
        type: 'bar',
        title: "Growth of History of Trade 2010-2024",
        data: {
          NorthAmerica: [100, 150, 200, 250],
          Europe: [80, 130, 180, 220]
        },
        minWords: 150
      },
      task2: {
        prompt: "Some believe that History of Trade will ultimately solve all humanity's problems. To what extent do you agree or disagree?",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Do you know much about History of Trade?", "Is it popular in your country?"],
      part2: {
        cue: "Describe a time you learned about History of Trade.",
        points: ["When was it?", "Who taught you?", "How did you feel?"]
      },
      part3: ["How will History of Trade evolve in the future?"]
    }
  },
  {
    difficulty: 'Easy',
    listening: {
      title: "Public Transport - Listening",
      script: "Welcome to the lecture on Public Transport. Today we will discuss its profound impact on society. Firstly, we must look at the overall effect. The statistics from 2024 show a 35% increase in relevant metrics. Furthermore, it is essential to consider the historical context dating back to 1990. Thank you for your attention.",
      questions: [
        { id: 'new13l1', question: "What is the topic?", type: 'mcq', options: [{id:'A',text:'Public Transport'}, {id:'B',text:'Math'}, {id:'C',text:'Science'}, {id:'D',text:'Art'}], correctAnswer: 'A' },
        { id: 'new13l2', label: "Percentage increase: ___%", type: 'text', correctAnswer: "35" },
        { id: 'new13l3', label: "Historical year mentioned: ___", type: 'text', correctAnswer: "1990" },
        { id: 'new13l4', question: "Was the lecture about Public Transport?", type: 'mcq', options: [{id:'A',text:'Yes'}, {id:'B',text:'No'}], correctAnswer: 'A' }
      ]
    },
    reading: {
      title: "Understanding Public Transport",
      passage: "Public Transport has drastically transformed how we live, work, and interact. Various studies highlight both positive and negative consequences. A key benefit is increased efficiency and connectivity, while the main drawback remains the steep learning curve and environmental cost. Experts suggest that by 2050, the integration of related systems will be absolute.",
      questions: [
        { id: 'new13r1', label: "Public Transport has transformed how we live.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'new13r2', label: "By ____, the integration will be absolute.", type: 'text', correctAnswer: "2050" },
        { id: 'new13r3', question: "What is the main drawback?", type: 'mcq', options: [{id:'A',text:'Cost'}, {id:'B',text:'Steep learning curve'}, {id:'C',text:'No drawbacks'}, {id:'D',text:'Time'}], correctAnswer: 'B' },
        { id: 'new13r4', label: "Efficiency is a negative consequence.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'new13r5', label: "There are both positive and negative consequences.", type: 'tfng', correctAnswer: 'TRUE' }
      ]
    },
    writing: {
      task1: {
        type: 'bar',
        title: "Growth of Public Transport 2010-2024",
        data: {
          NorthAmerica: [100, 150, 200, 250],
          Europe: [80, 130, 180, 220]
        },
        minWords: 150
      },
      task2: {
        prompt: "Some believe that Public Transport will ultimately solve all humanity's problems. To what extent do you agree or disagree?",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Do you know much about Public Transport?", "Is it popular in your country?"],
      part2: {
        cue: "Describe a time you learned about Public Transport.",
        points: ["When was it?", "Who taught you?", "How did you feel?"]
      },
      part3: ["How will Public Transport evolve in the future?"]
    }
  },
  {
    difficulty: 'Medium',
    listening: {
      title: "Future of Education - Listening",
      script: "Welcome to the lecture on Future of Education. Today we will discuss its profound impact on society. Firstly, we must look at the overall effect. The statistics from 2024 show a 35% increase in relevant metrics. Furthermore, it is essential to consider the historical context dating back to 1990. Thank you for your attention.",
      questions: [
        { id: 'new14l1', question: "What is the topic?", type: 'mcq', options: [{id:'A',text:'Future of Education'}, {id:'B',text:'Math'}, {id:'C',text:'Science'}, {id:'D',text:'Art'}], correctAnswer: 'A' },
        { id: 'new14l2', label: "Percentage increase: ___%", type: 'text', correctAnswer: "35" },
        { id: 'new14l3', label: "Historical year mentioned: ___", type: 'text', correctAnswer: "1990" },
        { id: 'new14l4', question: "Was the lecture about Future of Education?", type: 'mcq', options: [{id:'A',text:'Yes'}, {id:'B',text:'No'}], correctAnswer: 'A' }
      ]
    },
    reading: {
      title: "Understanding Future of Education",
      passage: "Future of Education has drastically transformed how we live, work, and interact. Various studies highlight both positive and negative consequences. A key benefit is increased efficiency and connectivity, while the main drawback remains the steep learning curve and environmental cost. Experts suggest that by 2050, the integration of related systems will be absolute.",
      questions: [
        { id: 'new14r1', label: "Future of Education has transformed how we live.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'new14r2', label: "By ____, the integration will be absolute.", type: 'text', correctAnswer: "2050" },
        { id: 'new14r3', question: "What is the main drawback?", type: 'mcq', options: [{id:'A',text:'Cost'}, {id:'B',text:'Steep learning curve'}, {id:'C',text:'No drawbacks'}, {id:'D',text:'Time'}], correctAnswer: 'B' },
        { id: 'new14r4', label: "Efficiency is a negative consequence.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'new14r5', label: "There are both positive and negative consequences.", type: 'tfng', correctAnswer: 'TRUE' }
      ]
    },
    writing: {
      task1: {
        type: 'bar',
        title: "Growth of Future of Education 2010-2024",
        data: {
          NorthAmerica: [100, 150, 200, 250],
          Europe: [80, 130, 180, 220]
        },
        minWords: 150
      },
      task2: {
        prompt: "Some believe that Future of Education will ultimately solve all humanity's problems. To what extent do you agree or disagree?",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Do you know much about Future of Education?", "Is it popular in your country?"],
      part2: {
        cue: "Describe a time you learned about Future of Education.",
        points: ["When was it?", "Who taught you?", "How did you feel?"]
      },
      part3: ["How will Future of Education evolve in the future?"]
    }
  },
  {
    difficulty: 'Hard',
    listening: {
      title: "Global Economics - Listening",
      script: "Welcome to the lecture on Global Economics. Today we will discuss its profound impact on society. Firstly, we must look at the overall effect. The statistics from 2024 show a 35% increase in relevant metrics. Furthermore, it is essential to consider the historical context dating back to 1990. Thank you for your attention.",
      questions: [
        { id: 'new15l1', question: "What is the topic?", type: 'mcq', options: [{id:'A',text:'Global Economics'}, {id:'B',text:'Math'}, {id:'C',text:'Science'}, {id:'D',text:'Art'}], correctAnswer: 'A' },
        { id: 'new15l2', label: "Percentage increase: ___%", type: 'text', correctAnswer: "35" },
        { id: 'new15l3', label: "Historical year mentioned: ___", type: 'text', correctAnswer: "1990" },
        { id: 'new15l4', question: "Was the lecture about Global Economics?", type: 'mcq', options: [{id:'A',text:'Yes'}, {id:'B',text:'No'}], correctAnswer: 'A' }
      ]
    },
    reading: {
      title: "Understanding Global Economics",
      passage: "Global Economics has drastically transformed how we live, work, and interact. Various studies highlight both positive and negative consequences. A key benefit is increased efficiency and connectivity, while the main drawback remains the steep learning curve and environmental cost. Experts suggest that by 2050, the integration of related systems will be absolute.",
      questions: [
        { id: 'new15r1', label: "Global Economics has transformed how we live.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'new15r2', label: "By ____, the integration will be absolute.", type: 'text', correctAnswer: "2050" },
        { id: 'new15r3', question: "What is the main drawback?", type: 'mcq', options: [{id:'A',text:'Cost'}, {id:'B',text:'Steep learning curve'}, {id:'C',text:'No drawbacks'}, {id:'D',text:'Time'}], correctAnswer: 'B' },
        { id: 'new15r4', label: "Efficiency is a negative consequence.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'new15r5', label: "There are both positive and negative consequences.", type: 'tfng', correctAnswer: 'TRUE' }
      ]
    },
    writing: {
      task1: {
        type: 'bar',
        title: "Growth of Global Economics 2010-2024",
        data: {
          NorthAmerica: [100, 150, 200, 250],
          Europe: [80, 130, 180, 220]
        },
        minWords: 150
      },
      task2: {
        prompt: "Some believe that Global Economics will ultimately solve all humanity's problems. To what extent do you agree or disagree?",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Do you know much about Global Economics?", "Is it popular in your country?"],
      part2: {
        cue: "Describe a time you learned about Global Economics.",
        points: ["When was it?", "Who taught you?", "How did you feel?"]
      },
      part3: ["How will Global Economics evolve in the future?"]
    }
  },
  {
    difficulty: 'Medium',
    listening: {
      title: "University Accommodation Interview",
      script: "You will hear a conversation between James, a student, and Mrs Peterson, a housing officer. Mrs Peterson: Good morning, can I help you? James: Yes, I need a room for next semester. I am a second year student. Mrs Peterson: We have a single room in Block C for 95 pounds per week, or a shared room in Block A for 65 pounds per week. James: I prefer the single room. Is Block C near the library? Mrs Peterson: Yes, about five minutes on foot. You need to pay a 200 pound deposit before the 15th of September. James: Do I need my student ID? Mrs Peterson: Yes, and your enrollment letter. Office is open Monday to Friday, 9am to 5pm. Your room number will be 312.",
      questions: [
        { id: 'rtl1l1', question: "What year is James?", type: 'mcq', options: [{id:'A',text:'First'}, {id:'B',text:'Second'}, {id:'C',text:'Third'}, {id:'D',text:'Fourth'}], correctAnswer: 'B' },
        { id: 'rtl1l2', question: "Single room weekly cost?", type: 'mcq', options: [{id:'A',text:'£65'}, {id:'B',text:'£75'}, {id:'C',text:'£85'}, {id:'D',text:'£95'}], correctAnswer: 'D' },
        { id: 'rtl1l3', question: "Distance to library?", type: 'mcq', options: [{id:'A',text:'2min'}, {id:'B',text:'5min'}, {id:'C',text:'10min'}, {id:'D',text:'15min'}], correctAnswer: 'B' },
        { id: 'rtl1l4', label: "Deposit amount: £___", type: 'text', correctAnswer: "200" },
        { id: 'rtl1l5', question: "What must James bring?", type: 'mcq', options: [{id:'A',text:'Passport'}, {id:'B',text:'ID + Enrollment letter'}, {id:'C',text:'Bank statement'}, {id:'D',text:'Only acceptance letter'}], correctAnswer: 'B' },
        { id: 'rtl1l6', question: "Office hours?", type: 'mcq', options: [{id:'A',text:'Mon-Sat 9-5'}, {id:'B',text:'Mon-Fri 9-5'}, {id:'C',text:'Mon-Fri 8-4'}, {id:'D',text:'Mon-Thu 9-6'}], correctAnswer: 'B' },
        { id: 'rtl1l7', label: "Room number: ___", type: 'text', correctAnswer: "312" },
        { id: 'rtl1l8', question: "Cheaper option?", type: 'mcq', options: [{id:'A',text:'Single Block C'}, {id:'B',text:'Shared Block A'}, {id:'C',text:'Studio Block D'}, {id:'D',text:'Double Block B'}], correctAnswer: 'B' },
        { id: 'rtl1l9', question: "Deposit deadline?", type: 'mcq', options: [{id:'A',text:'5 Sep'}, {id:'B',text:'10 Sep'}, {id:'C',text:'15 Sep'}, {id:'D',text:'20 Sep'}], correctAnswer: 'C' },
        { id: 'rtl1l10', question: "Where is conversation?", type: 'mcq', options: [{id:'A',text:'Library'}, {id:'B',text:'Classroom'}, {id:'C',text:'Housing office'}, {id:'D',text:'Student union'}], correctAnswer: 'C' }
      ]
    },
    reading: {
      title: "The Psychology of Colour",
      passage: "Colour psychology is the study of how colours affect human behaviour, emotions, and decisions. While responses vary by culture and experience, researchers have found consistent patterns. Red is emotionally intense. Studies show it raises heart rate and stimulates appetite — explaining its widespread use in restaurants. In sports, athletes wearing red win more often, possibly signalling dominance to opponents. Blue suggests calm, trust, and reliability. Many banks and corporations use blue to convey stability. The University of British Columbia found blue environments boost creative thinking, while red helps with detail-focused tasks. Yellow is the most visible colour to the human eye, linked to optimism and energy. However, too much yellow causes anxiety and eye fatigue. Green, associated with nature, reduces stress in hospitals, leading many medical facilities to incorporate it in their interior design. Marketers have long used colour strategically. Research suggests up to 90 percent of snap judgements about products are based on colour. A product's colour affects perceived value, quality, and even how food tastes. Colour and consumer behaviour remains one of the most active research areas in psychology.",
      questions: [
        { id: 'rtl1r1', label: "Red increases human heart rate.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl1r2', label: "Blue linked to creativity + trust.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl1r3', label: "Yellow invisible to colour-blind.", type: 'tfng', correctAnswer: 'NOT GIVEN' },
        { id: 'rtl1r4', label: "Green reduces hospital stress.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl1r5', label: "All people respond same to colour.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'rtl1r6', question: "Red effect on athletes?", type: 'mcq', options: [{id:'A',text:'Makes slower'}, {id:'B',text:'Associated with winning more'}, {id:'C',text:'Reduces aggression'}, {id:'D',text:'Increases teamwork'}], correctAnswer: 'B' },
        { id: 'rtl1r7', question: "Which university studied blue + creativity?", type: 'mcq', options: [{id:'A',text:'Oxford'}, {id:'B',text:'Harvard'}, {id:'C',text:'Univ of British Columbia'}, {id:'D',text:'MIT'}], correctAnswer: 'C' },
        { id: 'rtl1r8', question: "What % of product judgements use colour?", type: 'mcq', options: [{id:'A',text:'50%'}, {id:'B',text:'70%'}, {id:'C',text:'85%'}, {id:'D',text:'90%'}], correctAnswer: 'D' },
        { id: 'rtl1r9', question: "Why restaurants use red?", type: 'mcq', options: [{id:'A',text:'Cheap to paint'}, {id:'B',text:'Stimulates appetite'}, {id:'C',text:'Calms customers'}, {id:'D',text:'Easy to see'}], correctAnswer: 'B' },
        { id: 'rtl1r10', label: "Red boosts _______ to detail.", type: 'text', answer: "attention" },
        { id: 'rtl1r11', label: "Blue conveys _______ + professionalism.", type: 'text', answer: "stability" },
        { id: 'rtl1r12', label: "Yellow is most _______ colour.", type: 'text', answer: "visible" },
        { id: 'rtl1r13', label: "Colour affects behaviour, emotions and _______.", type: 'text', answer: "decisions" }
      ]
    },
    writing: {
      task1: {
        type: 'table',
        title: "Transport Usage in 4 Cities 2023",
        data: [
          { City: 'London', Car: '28%', Bus: '35%', Train: '30%', Bicycle: '7%' },
          { City: 'Tokyo', Car: '15%', Bus: '20%', Train: '55%', Bicycle: '10%' },
          { City: 'New York', Car: '45%', Bus: '30%', Train: '20%', Bicycle: '5%' },
          { City: 'Amsterdam', Car: '20%', Bus: '15%', Train: '25%', Bicycle: '40%' }
        ],
        minWords: 150
      },
      task2: {
        prompt: "Many young people spend excessive time on social media. Some argue this seriously harms mental health and social skills. To what extent do you agree or disagree?",
        minWords: 250
      }
    },
    speaking: {
      part1: [
        "Tell me about where you grew up.",
        "Do you enjoy spending time outdoors?",
        "What kind of music do you like?",
        "How important is technology in your life?",
        "Do you prefer working alone or in a group?"
      ],
      part2: {
        cue: "Describe a time you worked hard to achieve a goal.",
        points: ["What the goal was", "How long it took", "What challenges you faced", "How you felt when you achieved it"]
      },
      part3: [
        "Why do people find it hard to stay motivated?",
        "How has the definition of success changed?",
        "Do schools teach goal-setting effectively?"
      ]
    }
  },
  {
    difficulty: 'Medium',
    listening: {
      title: "City Tour Guide Info",
      script: "Good morning! I'm your tour guide for today. Our bus station information is crucial. The Museum opens at 9am and closes at 6pm. Note that the Art Gallery is closed on Mondays. Tickets for adults are £12, children £6, and seniors £8. For transport, Route 4 goes to the Castle and Route 7 goes to the Beach. Each tour duration is exactly 3 hours.",
      questions: [
        { id: 'rtl2l1', question: "Museum opening time?", type: 'mcq', options: [{id:'A',text:'8am'}, {id:'B',text:'9am'}, {id:'C',text:'10am'}, {id:'D',text:'11am'}], correctAnswer: 'B' },
        { id: 'rtl2l2', question: "Museum closing time?", type: 'mcq', options: [{id:'A',text:'5pm'}, {id:'B',text:'6pm'}, {id:'C',text:'7pm'}, {id:'D',text:'8pm'}], correctAnswer: 'B' },
        { id: 'rtl2l3', question: "The Art Gallery is closed on:", type: 'mcq', options: [{id:'A',text:'Sundays'}, {id:'B',text:'Mondays'}, {id:'C',text:'Fridays'}, {id:'D',text:'Saturdays'}], correctAnswer: 'B' },
        { id: 'rtl2l4', label: "Adult ticket price: £___", type: 'text', correctAnswer: "12" },
        { id: 'rtl2l5', label: "Children ticket price: £___", type: 'text', correctAnswer: "6" },
        { id: 'rtl2l6', label: "Senior ticket price: £___", type: 'text', correctAnswer: "8" },
        { id: 'rtl2l7', question: "Which route goes to the castle?", type: 'mcq', options: [{id:'A',text:'Route 4'}, {id:'B',text:'Route 7'}, {id:'C',text:'Route 10'}, {id:'D',text:'Route 1'}], correctAnswer: 'A' },
        { id: 'rtl2l8', question: "Which route goes to the beach?", type: 'mcq', options: [{id:'A',text:'Route 4'}, {id:'B',text:'Route 7'}, {id:'C',text:'Route 10'}, {id:'D',text:'Route 1'}], correctAnswer: 'B' },
        { id: 'rtl2l9', label: "Tour duration (hours): ___", type: 'text', correctAnswer: "3" },
        { id: 'rtl2l10', question: "What is the speaker's job?", type: 'mcq', options: [{id:'A',text:'Driver'}, {id:'B',text:'Museum guard'}, {id:'C',text:'Tour guide'}, {id:'D',text:'Student'}], correctAnswer: 'C' }
      ]
    },
    reading: {
      title: "The History of Coffee",
      passage: "Coffee originated in Ethiopia in the 9th century and spread to the Arabian Peninsula by the 15th century. The first coffee house opened in Constantinople in 1475. It reached Europe in the 17th century, though it was banned in some cities initially. Today, Brazil produces 40% of the world's coffee. Over 3 billion cups are consumed daily worldwide. Scientifically, caffeine blocks adenosine receptors in the brain. Moderate consumption (3-4 cups) is linked to reduced risk of type 2 diabetes and Alzheimer's. Over 25 million farmers depend on coffee for their livelihood.",
      questions: [
        { id: 'rtl2r1', label: "Coffee originated in Europe.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'rtl2r2', label: "Brazil produces 40% of coffee.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl2r3', label: "Caffeine blocks adenosine receptors.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl2r4', question: "First coffee house location?", type: 'mcq', options: [{id:'A',text:'Rome'}, {id:'B',text:'Paris'}, {id:'C',text:'Constantinople'}, {id:'D',text:'London'}], correctAnswer: 'C' },
        { id: 'rtl2r5', question: "Percentage of world coffee from Brazil?", type: 'mcq', options: [{id:'A',text:'25%'}, {id:'B',text:'40%'}, {id:'C',text:'50%'}, {id:'D',text:'60%'}], correctAnswer: 'B' },
        { id: 'rtl2r6', question: "Daily cups consumed worldwide?", type: 'mcq', options: [{id:'A',text:'1 billion'}, {id:'B',text:'2 billion'}, {id:'C',text:'3 billion'}, {id:'D',text:'5 billion'}], correctAnswer: 'C' },
        { id: 'rtl2r7', label: "Coffee houses were always legal.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'rtl2r8', label: "Number of farmers depending on coffee?", type: 'text', correctAnswer: "25 million" },
        { id: 'rtl2r9', label: "Coffee originated in the ___ century.", type: 'text', correctAnswer: "9th" },
        { id: 'rtl2r10', label: "Moderate drinking reduces ____ risk.", type: 'text', correctAnswer: "diabetes" },
        { id: 'rtl2r11', label: "Cafeine affects ____ receptors.", type: 'text', correctAnswer: "adenosine" },
        { id: 'rtl2r12', label: "Constantinople house opened in ____.", type: 'text', correctAnswer: "1475" },
        { id: 'rtl2r13', label: "Coffee spread to Arabia in 15th century.", type: 'tfng', correctAnswer: 'TRUE' }
      ]
    },
    writing: {
      task1: {
        type: 'bar',
        title: "Global Smartphone Sales 2019-2023",
        data: {
          Asia: [300, 320, 350, 380, 400],
          Europe: [150, 140, 130, 145, 150],
          Americas: [200, 210, 220, 215, 225]
        },
        minWords: 150
      },
      task2: {
        prompt: "Technology makes humans less intelligent. Discuss both views and give your opinion.",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Food", "Cooking", "Favourite meals", "Hometown"],
      part2: {
        cue: "Describe a book or film that influenced you deeply.",
        points: ["What was it?", "What was it about?", "How it influenced you"]
      },
      part3: ["Role of media in modern education."]
    }
  },
  {
    difficulty: 'Medium',
    listening: {
      title: "Job Interview Prep",
      script: "Hi Alex, are you ready for your interview? Remember to research the company thoroughly before you go. You should arrive 10 minutes early. The dress code is strictly formal. The salary range they mentioned is £28,000 to £32,000. Don't forget to bring 2 copies of your CV. Finally, send a follow-up email within 24 hours of the interview.",
      questions: [
        { id: 'rtl3l1', label: "How early to arrive? (mins)", type: 'text', correctAnswer: "10" },
        { id: 'rtl3l2', question: "Dress code style?", type: 'mcq', options: [{id:'A',text:'Casual'}, {id:'B',text:'Formal'}, {id:'C',text:'Smart-casual'}, {id:'D',text:'Any'}], correctAnswer: 'B' },
        { id: 'rtl3l3', label: "Minimum salary mentioned? (£)", type: 'text', correctAnswer: "28000" },
        { id: 'rtl3l4', label: "Maximum salary mentioned? (£)", type: 'text', correctAnswer: "32000" },
        { id: 'rtl3l5', label: "How many CV copies to bring?", type: 'text', correctAnswer: "2" },
        { id: 'rtl3l6', label: "Send follow-up email within ___ hours.", type: 'text', correctAnswer: "24" },
        { id: 'rtl3l7', question: "Should you research company?", type: 'mcq', options: [{id:'A',text:'Yes'}, {id:'B',text:'No'}, {id:'C',text:'Optional'}, {id:'D',text:'If asked'}], correctAnswer: 'A' },
        { id: 'rtl3l8', label: "What is the email for?", type: 'text', correctAnswer: "follow-up" },
        { id: 'rtl3l9', question: "Is the dress code strictly formal?", type: 'mcq', options: [{id:'A',text:'Yes'}, {id:'B',text:'No'}, {id:'C',text:'N/A'}, {id:'D',text:'Maybe'}], correctAnswer: 'A' },
        { id: 'rtl3l10', question: "Who are talking?", type: 'mcq', options: [{id:'A',text:'Interviewer'}, {id:'B',text:'Two friends'}, {id:'C',text:'Teacher and pupil'}, {id:'D',text:'Employer'}], correctAnswer: 'B' }
      ]
    },
    reading: {
      title: "Renewable Energy Revolution",
      passage: "Solar energy costs have dropped by 89% since 2010. Wind energy now powers 10% of global electricity. In 2015, 195 countries signed the Paris Agreement. The net zero target for most nations is 2050. Pakistan reaching a 2.9GW solar capacity as of 2024 is notable. However, challenges like storage, grid infrastructure, and cost remain. Jobs in the renewable sector reached 13.7 million in 2022.",
      questions: [
        { id: 'rtl3r1', label: "Solar costs dropped 89% since 2010.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl3r2', label: "Pakistan has 2.9GW solar capacity in 2024.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl3r3', label: "The Paris Agreement was signed in 2010.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'rtl3r4', label: "Wind powers ___% of global electricity.", type: 'text', correctAnswer: "10" },
        { id: 'rtl3r5', question: "Net zero target year for most nations?", type: 'mcq', options: [{id:'A',text:'2030'}, {id:'B',text:'2040'}, {id:'C',text:'2050'}, {id:'D',text:'2060'}], correctAnswer: 'C' },
        { id: 'rtl3r6', label: "Renewable sector jobs in 2022 (millions)?", type: 'text', correctAnswer: "13.7" },
        { id: 'rtl3r7', label: "Solar is more expensive than 2010.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'rtl3r8', label: "Storage is a challenge.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl3r9', label: "Countries signed Paris Agreement?", type: 'text', correctAnswer: "195" },
        { id: 'rtl3r10', label: "Grid ____ is a major challenge.", type: 'text', correctAnswer: "infrastructure" },
        { id: 'rtl3r11', label: "Net zero protects planet.", type: 'tfng', correctAnswer: 'NOT GIVEN' },
        { id: 'rtl3r12', question: "Solar capacity in Pakistan 2024?", type: 'mcq', options: [{id:'A',text:'1GW'}, {id:'B',text:'2GW'}, {id:'C',text:'2.9GW'}, {id:'D',text:'5GW'}], correctAnswer: 'C' },
        { id: 'rtl3r13', label: "Renewable jobs are increasing.", type: 'tfng', correctAnswer: 'TRUE' }
      ]
    },
    writing: {
      task1: {
        type: 'line',
        title: "Renewable Energy Growth 2010-2025",
        data: {
          Solar: [5, 15, 30, 60, 120, 250],
          Wind: [20, 40, 70, 110, 160, 220],
          Hydro: [300, 310, 320, 330, 340, 350]
        },
        minWords: 150
      },
      task2: {
        prompt: "Governments should make public transport completely free. Agree or disagree?",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Work", "Study", "Future ambitions", "Hobbies"],
      part2: {
        cue: "Describe a person who changed your life.",
        points: ["Who were they?", "How they changed you", "Why they are important"]
      },
      part3: ["Impact of role models on young people."]
    }
  },
  {
    difficulty: 'Medium',
    listening: {
      title: "Medical Appointment",
      script: "Good morning, Sarah. I see you've had a headache for 3 days. Your temperature is 37.8°C, which is a mild fever. I'll prescribe Paracetamol 500mg to be taken twice daily. Please rest and drink 2 litres of water every day. Your follow-up is next Thursday at 10:30am. You need a blood test at City Lab; please take this form with you.",
      questions: [
        { id: 'rtl4l1', label: "Patient name?", type: 'text', correctAnswer: "Sarah" },
        { id: 'rtl4l2', label: "Headache duration (days)?", type: 'text', correctAnswer: "3" },
        { id: 'rtl4l3', label: "Sarah's temperature (°C)?", type: 'text', correctAnswer: "37.8" },
        { id: 'rtl4l4', label: "Medicine name?", type: 'text', correctAnswer: "Paracetamol" },
        { id: 'rtl4l5', label: "Medicine dose (mg)?", type: 'text', correctAnswer: "500" },
        { id: 'rtl4l6', label: "Times to take medicine daily?", type: 'text', correctAnswer: "2" },
        { id: 'rtl4l7', label: "Water amount daily (litres)?", type: 'text', correctAnswer: "2" },
        { id: 'rtl4l8', question: "Follow-up day?", type: 'mcq', options: [{id:'A',text:'Monday'}, {id:'B',text:'Tuesday'}, {id:'C',text:'Wednesday'}, {id:'D',text:'Thursday'}], correctAnswer: 'D' },
        { id: 'rtl4l9', label: "Follow-up time?", type: 'text', correctAnswer: "10:30am" },
        { id: 'rtl4l10', label: "Lab name?", type: 'text', correctAnswer: "City Lab" }
      ]
    },
    reading: {
      title: "Urbanisation and Its Effects",
      passage: "By 2023, 55% of the world population lives in cities, expected to rise to 68% by 2050. There are 33 megacities (10m+ people) worldwide. Karachi is Pakistan's largest city with 16 million. While urbanisation offers jobs and healthcare, it brings pollution and traffic. Urban poverty affects 1 billion people globally. Green city initiatives are growing in places like Singapore and Copenhagen.",
      questions: [
        { id: 'rtl4r1', label: "55% of world lives in cities 2023.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl4r2', label: "Karachi is smallest city in Pakistan.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'rtl4r3', label: "There are 33 megacities.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl4r4', question: "Urban population 2050 (%)?", type: 'mcq', options: [{id:'A',text:'55%'}, {id:'B',text:'60%'}, {id:'C',text:'68%'}, {id:'D',text:'75%'}], correctAnswer: 'C' },
        { id: 'rtl4r5', label: "Karachi population (millions)?", type: 'text', correctAnswer: "16" },
        { id: 'rtl4r6', label: "How many people in urban poverty?", type: 'text', correctAnswer: "1 billion" },
        { id: 'rtl4r7', question: "Green city example?", type: 'mcq', options: [{id:'A',text:'New York'}, {id:'B',text:'Singapore'}, {id:'C',text:'London'}, {id:'D',text:'Beijing'}], correctAnswer: 'B' },
        { id: 'rtl4r8', label: "Urbanisation ONLY has benefits.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'rtl4r9', label: "Pollution is an urban problem.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl4r10', label: "Singapore is a green city.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl4r11', label: "London population growth.", type: 'tfng', correctAnswer: 'NOT GIVEN' },
        { id: 'rtl4r12', label: "Healthcare is better in cities.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl4r13', label: "Urbanisation will stop in 2050.", type: 'tfng', correctAnswer: 'FALSE' }
      ]
    },
    writing: {
      task1: {
        type: 'pie',
        title: "Household Spending Comparison 2023",
        data: [
          { name: 'Food', Pakistan: 45, UK: 15 },
          { name: 'Housing', Pakistan: 15, UK: 35 },
          { name: 'Transport', Pakistan: 10, UK: 20 },
          { name: 'Health', Pakistan: 20, UK: 10 },
          { name: 'Other', Pakistan: 10, UK: 20 }
        ],
        minWords: 150
      },
      task2: {
        prompt: "Living in cities is better than rural areas. Discuss both views.",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Health", "Exercise", "Diet", "Sleep habits"],
      part2: {
        cue: "Describe a city you would like to visit.",
        points: ["Where is it?", "What can you do there?", "Why you want to visit"]
      },
      part3: ["Effects of urbanisation on communities."]
    }
  },
  {
    difficulty: 'Medium',
    listening: {
      title: "Library Orientation",
      script: "Welcome to the library. Membership is free with your student ID. Books can be borrowed for 3 weeks; late fines are £0.20 per day. Study rooms must be booked online 24 hours ahead. Digital resources require your student login. Printing costs 5p per page for black and white, and 20p for colour. We are open 8am to 10pm weekdays and 10am to 6pm on weekends.",
      questions: [
        { id: 'rtl5l1', label: "Membership cost?", type: 'text', correctAnswer: "free" },
        { id: 'rtl5l2', label: "What is needed for membership?", type: 'text', correctAnswer: "student ID" },
        { id: 'rtl5l3', label: "Borrowing period (weeks)?", type: 'text', correctAnswer: "3" },
        { id: 'rtl5l4', label: "Late fine per day: £___", type: 'text', correctAnswer: "0.20" },
        { id: 'rtl5l5', label: "Book study rooms ___ hours ahead.", type: 'text', correctAnswer: "24" },
        { id: 'rtl5l6', label: "Printing colour page: ___p", type: 'text', correctAnswer: "20" },
        { id: 'rtl5l7', label: "Printing black page: ___p", type: 'text', correctAnswer: "5" },
        { id: 'rtl5l8', label: "Weekday opening time?", type: 'text', correctAnswer: "8am" },
        { id: 'rtl5l9', label: "Weekday closing time?", type: 'text', correctAnswer: "10pm" },
        { id: 'rtl5l10', label: "Weekend closing time?", type: 'text', correctAnswer: "6pm" }
      ]
    },
    reading: {
      title: "Rise of Electric Vehicles",
      passage: "The first EV was invented in 1884 by Thomas Parker. Tesla, founded in 2003, launched the Model S in 2012. Global EV sales reached 14 million units in 2023, with China accounting for 60% of these. Battery range has improved by 400% since 2010. There are 2.7 million charging stations worldwide as of 2024. Pakistan launched its first EV policy in 2020. Most countries target a full EV transition by 2040.",
      questions: [
        { id: 'rtl5r1', label: "First EV was invented in 1884.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl5r2', label: "China has 60% of global EV sales.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl5r3', label: "EV sales in 2023 were 10 million.", type: 'tfng', correctAnswer: 'FALSE' },
        { id: 'rtl5r4', label: "Who invented the first EV?", type: 'text', correctAnswer: "Thomas Parker" },
        { id: 'rtl5r5', label: "Tesla founded year?", type: 'text', correctAnswer: "2003" },
        { id: 'rtl5r6', label: "EV sales 2023 (millions)?", type: 'text', correctAnswer: "14" },
        { id: 'rtl5r7', label: "Charging stations worldwide 2024?", type: 'text', correctAnswer: "2.7 million" },
        { id: 'rtl5r8', label: "Pakistan's EV policy year?", type: 'text', correctAnswer: "2020" },
        { id: 'rtl5r9', label: "Battery range improved by ___% since 2010.", type: 'text', correctAnswer: "400" },
        { id: 'rtl5r10', label: "China is lead EV producer.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl5r11', label: "Norway has most EVs per person.", type: 'tfng', correctAnswer: 'NOT GIVEN' },
        { id: 'rtl5r12', label: "Model S launched 2012.", type: 'tfng', correctAnswer: 'TRUE' },
        { id: 'rtl5r13', question: "EV target year for most nations?", type: 'mcq', options: [{id:'A',text:'2030'}, {id:'B',text:'2040'}, {id:'C',text:'2050'}, {id:'D',text:'2060'}], correctAnswer: 'B' }
      ]
    },
    writing: {
      task1: {
        type: 'table',
        title: "EV Sales by Country 2023",
        data: [
          { Country: 'China', Units: '8.4 million' },
          { Country: 'Germany', Units: '0.7 million' },
          { Country: 'USA', Units: '1.2 million' },
          { Country: 'UK', Units: '0.3 million' },
          { Country: 'Norway', Units: '0.1 million' }
        ],
        minWords: 150
      },
      task2: {
        prompt: "Young people should be required to do community service. To what extent do you agree?",
        minWords: 250
      }
    },
    speaking: {
      part1: ["Transport", "Environment", "Travel habits"],
      part2: {
        cue: "Describe a journey that was important to you.",
        points: ["Where did you go?", "Who was with you?", "Why it was important"]
      },
      part3: ["Individual environmental responsibility."]
    }
  }
];
