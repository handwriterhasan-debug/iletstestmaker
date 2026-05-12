import React from 'react';

export interface PracticeListeningQuestion {
  id: string;
  label: string;
  type: 'mcq' | 'text';
  options?: string[];
  answer: string;
}

export interface PracticeListeningStory {
  title: string;
  text: string;
  questions: PracticeListeningQuestion[];
}

export interface PracticeReadingQuestion {
  id: string;
  label: string;
  type: 'mcq' | 'tfng' | 'text';
  options?: string[];
  placeholder?: string;
  answer: string;
}

export interface PracticeReadingPassage {
  title: string;
  text: string;
  questions: PracticeReadingQuestion[];
}

export interface PracticeWritingTask {
  task1: {
    title: string;
    description: string;
    data: { label: string; value: string }[];
    minWords: number;
  };
  task2: {
    prompt: string;
    minWords: number;
  };
}

export interface PracticeSpeakingSet {
  part1: string[];
  part2: {
    cue: string;
    points: string[];
  };
  part3: string[];
}

export interface PracticeLibrary {
  listening: PracticeListeningStory[];
  reading: PracticeReadingPassage[];
  writing: PracticeWritingTask[];
  speaking: PracticeSpeakingSet[];
}

export const practiceLibrary: PracticeLibrary = {
  listening: [
    {
      title: "The Brave King Kovu",
      text: "Once upon a time, in a vast African jungle, there lived a mighty lion named Kovu. Kovu was known across the land for his golden mane and kind heart. One dry season, when all the rivers had dried up, the animals were dying of thirst. Kovu decided to journey alone to find water. After three days of walking, he discovered a hidden waterfall deep in the mountains. He returned and led all the animals to safety. From that day, every animal in the jungle called Kovu their true king — not because of his strength, but because of his courage and sacrifice.",
      questions: [
        { id: 'l1q1', label: "What is the name of the main character?", type: 'mcq', options: ['Simba', 'Kovu', 'Mufasa', 'Zazu'], answer: 'B' },
        { id: 'l1q2', label: "Why were the animals in danger?", type: 'mcq', options: ['A fire destroyed the jungle', 'A hunter was chasing them', 'All rivers had dried up', 'A storm flooded the land'], answer: 'C' },
        { id: 'l1q3', label: "What did Kovu find after 3 days?", type: 'mcq', options: ['A new jungle', 'A hidden waterfall', 'Another pride', 'A food source'], answer: 'B' },
        { id: 'l1q4', label: "What made Kovu a true king according to the story?", type: 'text', answer: "His courage and sacrifice, not his strength" },
        { id: 'l1q5', label: "What is the ending of the story?", type: 'mcq', options: ['Kovu left the jungle forever', 'Animals made Kovu their king', 'Kovu fought other lions', 'The waterfall disappeared'], answer: 'B' }
      ]
    }
  ],
  reading: [
    {
      title: "The Rise of Artificial Intelligence",
      text: `Artificial Intelligence, commonly known as AI, has become one of the most transformative technologies of the 21st century. From simple calculators to complex neural networks, the journey of AI spans over seven decades of human curiosity and innovation.

The story of AI begins in 1950, when mathematician Alan Turing proposed a revolutionary question: 'Can machines think?' His famous Turing Test challenged scientists to create a machine indistinguishable from a human in conversation. This single question sparked a global race that continues to this day.

In the 1960s and 1970s, early AI programs could solve mathematical problems and play chess. However, progress slowed dramatically in the 1980s — a period researchers now call the 'AI Winter' — when governments and companies cut funding after AI failed to meet overly optimistic expectations.

The real breakthrough came in 2012, when a deep learning system called AlexNet stunned the scientific world by winning an image recognition competition with a 10% lead over all competitors. This moment is considered the birth of modern AI.

Today, AI powers voice assistants like Siri and Alexa, recommends videos on YouTube, detects cancer in medical scans, and drives autonomous vehicles. Companies like Google, Microsoft, and OpenAI invest billions annually in AI research.

However, AI also brings serious concerns. Many experts warn of job displacement as machines replace human workers in factories, offices, and even creative fields. Others raise ethical questions about bias in AI systems, privacy violations, and the danger of autonomous weapons.

Despite these challenges, most scientists agree that AI will define the next century of human civilization — much like electricity defined the last. The question is no longer whether AI will change our world, but whether humans are prepared to guide that change wisely.`,
      questions: [
        { id: 'r1q1', label: "Who proposed the famous Turing Test?", type: 'mcq', options: ['Bill Gates', 'Alan Turing', 'Elon Musk', 'Albert Einstein'], answer: 'B' },
        { id: 'r1q2', label: "What does 'AI Winter' refer to?", type: 'mcq', options: ['AI systems breaking in cold weather', 'A period of reduced AI funding and progress', 'An AI virus that damaged computers', 'A government ban on AI research'], answer: 'B' },
        { id: 'r1q3', label: "Alan Turing invented the first computer.", type: 'tfng', answer: 'NOT GIVEN' },
        { id: 'r1q4', label: "AlexNet won an image recognition competition in 2012.", type: 'tfng', answer: 'TRUE' },
        { id: 'r1q5', label: "AI has no impact on medical fields.", type: 'tfng', answer: 'FALSE' },
        { id: 'r1q6', label: "When did AI research begin to slow down?", type: 'mcq', options: ['1950s', '1960s', '1980s', '2000s'], answer: 'C' },
        { id: 'r1q7', label: "Name TWO companies mentioned that invest in AI.", type: 'text', answer: "Google, Microsoft, OpenAI" },
        { id: 'r1q8', label: "What was AlexNet's achievement?", type: 'mcq', options: ['It beat humans at chess', 'It won an image recognition competition', 'It wrote a novel', 'It drove a car autonomously'], answer: 'B' },
        { id: 'r1q9', label: "Most scientists believe AI will define the next century.", type: 'tfng', answer: 'TRUE' },
        { id: 'r1q10', label: "What is the main concern about AI jobs?", type: 'mcq', options: ['AI makes humans lazy', 'Machines may replace human workers', 'AI costs too much money', 'AI only works in English'], answer: 'B' }
      ]
    }
  ],
  writing: [
    {
      task1: {
        title: "VIRAT KOHLI",
        description: "Look at the information card below about Virat Kohli. Write a descriptive paragraph about this person — who he is, what he is known for, and why he is important in cricket. Write at least 150 words.",
        data: [
          { label: "NAME", value: "Virat Kohli" },
          { label: "BORN", value: "November 5, 1988" },
          { label: "ROLE", value: "Batsman & Captain" },
          { label: "COUNTRY", value: "India 🇮🇳" },
          { label: "ODI AVERAGE", value: "58.07" },
          { label: "TEST CENTURIES", value: "30" },
          { label: "WORLD CUP WINS", value: "2011" },
          { label: "KNOWN FOR", value: "Aggressive batting & fitness" }
        ],
        minWords: 150
      },
      task2: {
        prompt: "In recent years, tensions between Iran and the United States have escalated significantly. Some believe military conflict is inevitable, while others argue diplomacy is still possible.\n\nWrite an essay discussing:\n- The main causes of conflict between Iran and USA\n- The possible consequences of a war\n- Your opinion on whether peace is achievable\n\nWrite at least 250 words.",
        minWords: 250
      }
    }
  ],
  speaking: [
    {
      part1: [
        "Do you live in a house or apartment?",
        "What do you enjoy most about where you live?",
        "How do you usually travel to school or work?",
        "What is your favourite meal of the day?",
        "Do you prefer mornings or evenings? Why?"
      ],
      part2: {
        cue: "Describe a person who has inspired you.",
        points: ["Who this person is", "How you know them", "What they have achieved", "Why they inspire you"]
      },
      part3: [
        "Why do some people become role models for others?",
        "Do celebrities have a responsibility to inspire youth?",
        "Has social media changed who young people look up to?"
      ]
    },
    {
      part1: [
        "How many hours a day do you use your phone?",
        "What apps do you use most often?",
        "Do you think technology makes life easier or harder?",
        "Can you remember life without smartphones?",
        "What technology could you not live without?"
      ],
      part2: {
        cue: "Describe a time when you faced a big challenge.",
        points: ["What the challenge was", "When it happened", "How you dealt with it", "What you learned from it"]
      },
      part3: [
        "Why is it important to face difficulties in life?",
        "Do schools prepare students for real-life challenges?",
        "How can governments help people who face poverty?"
      ]
    },
    {
      part1: [
        "Do you play any sports regularly?",
        "Is fitness important to you? Why?",
        "What is the most popular sport in your country?",
        "Did you play sports as a child?",
        "Would you rather watch or play sports?"
      ],
      part2: {
        cue: "Describe your favourite place to study or work.",
        points: ["Where this place is", "What it looks like", "Why you prefer it", "How it helps you focus"]
      },
      part3: [
        "Is it better to study alone or in a group?",
        "Do you think schools provide enough quiet spaces for students?",
        "How has the way people study changed in the last ten years?"
      ]
    },
    {
      part1: [
        "Have you ever travelled to another country?",
        "What is your favourite place you have visited?",
        "Do you prefer mountains or beaches?",
        "How do you prepare for a trip?",
        "What country would you most like to visit?"
      ],
      part2: {
        cue: "Describe a skill you would like to learn.",
        points: ["What the skill is", "Why you want to learn it", "How you plan to learn it", "How it will help your future"]
      },
      part3: [
        "What are the most important skills for young people today?",
        "Do you think schools should focus more on practical skills?",
        "How does technology affect the way we learn new things?"
      ]
    },
    {
      part1: [
        "What subject did you enjoy most at school?",
        "Do you think exams are the best way to test students?",
        "What would you study if you could choose anything?",
        "Did you enjoy school? Why or why not?",
        "What do you think makes a great teacher?"
      ],
      part2: {
        cue: "Describe a film or book that affected you deeply.",
        points: ["What it is called", "What it is about", "Why it affected you", "Would you recommend it?"]
      },
      part3: [
        "Why do some stories remain popular for hundreds of years?",
        "Do you think films are more regular than books for storytelling today?",
        "How does the medium of a story change its impact?"
      ]
    },
    {
      part1: [
        "What is your favorite type of food?",
        "Do you prefer eating at home or at a restaurant?",
        "Is traditional food important in your culture?",
        "Have you ever tried cooking a new dish?",
        "What kind of food did you like most as a child?"
      ],
      part2: {
        cue: "Describe a journey you will never forget.",
        points: ["Where you went", "Who you went with", "What happened during the journey", "Why it was memorable"]
      },
      part3: [
        "How has the way people travel changed in recent years?",
        "Do you think it's better to travel alone or with others?",
        "What are the benefits of experiencing different cultures?"
      ]
    },
    {
      part1: [
        "Who is your best friend?",
        "How did you meet your best friend?",
        "What do you value most in a friendship?",
        "Do you prefer having a few close friends or many acquaintances?",
        "Have you maintained any friendships from childhood?"
      ],
      part2: {
        cue: "Describe a tradition in your family or culture.",
        points: ["What the tradition is", "When it is practiced", "Who participates in it", "Why it is important to you"]
      },
      part3: [
        "Are traditional customs still important to young people today?",
        "How can global culture affect local traditions?",
        "Do you think traditions should evolve over time?"
      ]
    },
    {
      part1: [
        "What kind of music do you like?",
        "Do you play any musical instruments?",
        "Is art important in your daily life?",
        "When was the last time you went to a concert or art gallery?",
        "Do you prefer classic or modern art?"
      ],
      part2: {
        cue: "Describe a time you helped someone.",
        points: ["Who you helped", "What you did to help them", "How they reacted", "How you felt afterwards"]
      },
      part3: [
        "Why is it important for people to help each other in a community?",
        "Do you think children should be taught to volunteer from a young age?",
        "How can technology be used to help people in need?"
      ]
    },
    {
      part1: [
        "Do you worry about the environment?",
        "What do you do to help protect the planet?",
        "Is there a lot of pollution in your city?",
        "Do you think nature is important for mental health?",
        "Have you ever planted a tree?"
      ],
      part2: {
        cue: "Describe your dream job.",
        points: ["What the job is", "What qualifications you would need", "Why you are interested in it", "How you plan to achieve it"]
      },
      part3: [
        "What are the most important factors for job satisfaction?",
        "Do you think people should prioritize passion or salary in their careers?",
        "How will the job market change in the next twenty years?"
      ]
    },
    {
      part1: [
        "What are your plans for the future?",
        "Do you have a personal goal you're working on right now?",
        "What did you want to be when you were a child?",
        "Is it important to have dreams and ambitions?",
        "Where do you see yourself in ten years?"
      ],
      part2: {
        cue: "Describe a goal you are working towards.",
        points: ["What the goal is", "Why it is important to you", "How you are working to achieve it", "When you hope to reach it"]
      },
      part3: [
        "Why do some people find it difficult to stick to their goals?",
        "How can setting small milestones help in achieving a larger goal?",
        "Does society put too much pressure on individuals to achieve success?"
      ]
    }
  ]
};
