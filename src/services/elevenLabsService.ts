const ELEVEN_LABS_API_KEY = 'sk_7f3b6db4f8ebb7fe98c47bd269dbea54650e1b7dd56e72f8';
const DEFAULT_VOICE_ID = '21mO0643Tfqjt77M3894'; // Rachel - Natural and clear

export async function textToSpeech(text: string, voiceId: string = DEFAULT_VOICE_ID): Promise<string | null> {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('ElevenLabs API failed, using fallback:', errorData);
      throw new Error('ElevenLabs API request failed');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn('TTS Error, falling back to Web Speech API:', error);
    
    // Fallback: Use Web Speech API (Native Browser TTS)
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      // Try to find a good English voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US'));
      if (englishVoice) utterance.voice = englishVoice;

      window.speechSynthesis.speak(utterance);
      
      // Since native TTS doesn't return a URL for an Audio object, 
      // we return null to signal the component to NOT try and play it manually.
      // Alternatively, we can just handle the speaking here.
      utterance.onend = () => resolve(null);
      utterance.onerror = () => resolve(null);
    });
  }
}
