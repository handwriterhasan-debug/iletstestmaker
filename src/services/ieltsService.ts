import { supabase } from '../lib/supabase';
import { getSecureStorage, setSecureStorage } from '../lib/security';

// Complete Mock ieltsService - No Supabase Dependency for logic, only for mock storage consistency
const STORAGE_KEYS = {
  REGISTRATION: 'ielts_active_registration',
  RESULTS: 'ielts_test_results',
  PRACTICE: 'ielts_practice_history',
  ANSWERS: 'ielts_test_answers'
};

const getStorageItem = (key: string, defaultValue: any = null) => {
  return getSecureStorage(key, defaultValue);
};

const setStorageItem = (key: string, value: any) => {
  setSecureStorage(key, value);
};

export const ieltsService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    const localProfile = getStorageItem('ielts_mock_profile', {});
    
    if (!data && !localProfile.full_name) return null;
    
    return {
      ...(data || {}),
      ...(localProfile || {})
    };
  },

  async saveRegistration(regData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fallback to random if not provided (there are 15 sets now)
    const setIndex = regData.testSetIndex !== undefined ? regData.testSetIndex : Math.floor(Math.random() * 15);

    const data: any = {
      id: user ? undefined : 'mock_reg_' + Date.now(),
      user_id: user?.id,
      roll_number: regData.rollNumber,
      test_date: regData.testDate,
      status: 'upcoming',
      created_at: new Date().toISOString(),
      delays_used: 0,
      test_set_index: setIndex,
      difficulty: regData.difficulty || 'Medium',
      name: regData.name, // Keep for UI popup
      email: regData.email
    };

    if (user) {
      const { data: saved, error } = await supabase.from('test_registrations').insert([
        { 
          user_id: user.id,
          roll_number: regData.rollNumber,
          test_date: regData.testDate,
          status: 'upcoming',
          delays_used: 0,
          test_set_index: setIndex
        }
      ]).select().single();
      
      if (error) {
         console.warn("Supabase insert failed or missing column, saving to local only.", error);
      }
      
      const finalReg = { ...(saved || data), difficulty: regData.difficulty || 'Medium' };
      setStorageItem(STORAGE_KEYS.REGISTRATION, finalReg);
      return finalReg;
    }

    setStorageItem(STORAGE_KEYS.REGISTRATION, data);
    return data;
  },

  async getLatestRegistration() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('test_registrations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (data) {
        setStorageItem(STORAGE_KEYS.REGISTRATION, data);
        return data;
      }
    }
    return getStorageItem(STORAGE_KEYS.REGISTRATION);
  },

  async getActiveRegistration() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('test_registrations').select('*').eq('user_id', user.id).in('status', ['upcoming', 'in-progress']).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (data) {
        setStorageItem(STORAGE_KEYS.REGISTRATION, data);
        return data;
      } else {
        localStorage.removeItem(STORAGE_KEYS.REGISTRATION);
        return null;
      }
    }
    const stored = getStorageItem(STORAGE_KEYS.REGISTRATION);
    if (stored && ['upcoming', 'in-progress'].includes(stored.status)) {
      // Auto-expire guest registrations that are older than 24 hours
      const testDate = new Date(stored.testDate || stored.test_date || stored.created_at).getTime();
      if (Date.now() - testDate > 24 * 60 * 60 * 1000) {
         localStorage.removeItem(STORAGE_KEYS.REGISTRATION);
         return null;
      }
      return stored;
    }
    localStorage.removeItem(STORAGE_KEYS.REGISTRATION);
    return null;
  },

  async updateRegistrationStatus(regId: string, status: any) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && regId && !regId.startsWith('mock_')) {
      const { data, error } = await supabase
        .from('test_registrations')
        .update({ status })
        .eq('id', regId)
        .select()
        .single();
      
      if (!error && data) {
        setStorageItem(STORAGE_KEYS.REGISTRATION, data);
        return data;
      }
    }

    const reg = getStorageItem(STORAGE_KEYS.REGISTRATION);
    if (reg && reg.id === regId) {
      reg.status = status;
      setStorageItem(STORAGE_KEYS.REGISTRATION, reg);
      return reg;
    }
    return null;
  },

  async cancelRegistration(regId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && regId && !regId.startsWith('mock_')) {
      try {
        await supabase.from('test_registrations').delete().eq('id', regId);
      } catch (err) {
        console.error("Failed to delete from Supabase", err);
      }
    }

    const reg = getStorageItem(STORAGE_KEYS.REGISTRATION);
    if (reg && reg.id === regId) {
      localStorage.removeItem(STORAGE_KEYS.REGISTRATION);
    }
    return true; 
  },

  async addDelay(regId: string, newDate: string, delaysUsed: number) {
    const { data: { user } } = await supabase.auth.getUser();
    const updatedCount = delaysUsed + 1;

    if (user && regId && !regId.startsWith('mock_')) {
      const { data, error } = await supabase
        .from('test_registrations')
        .update({ 
          test_date: newDate,
          delays_used: updatedCount
        })
        .eq('id', regId)
        .select()
        .single();
      
      if (!error && data) {
        setStorageItem(STORAGE_KEYS.REGISTRATION, data);
        return data;
      }
    }

    const reg = getStorageItem(STORAGE_KEYS.REGISTRATION);
    if (reg && reg.id === regId) {
      reg.test_date = newDate;
      reg.delays_used = updatedCount;
      setStorageItem(STORAGE_KEYS.REGISTRATION, reg);
      return reg;
    }
    return null;
  },

  async saveAnswers(regId: string, section: string, answers: any, metadata = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Local storage persistence
    const allAnswers = getStorageItem(STORAGE_KEYS.ANSWERS, []);
    const index = allAnswers.findIndex((a: any) => a.registration_id === regId && a.section === section);
    
    const entry = {
      registration_id: regId,
      section,
      answers,
      saved_at: new Date().toISOString(),
      ...metadata
    };

    if (index > -1) {
      allAnswers[index] = entry;
    } else {
      allAnswers.push(entry);
    }
    setStorageItem(STORAGE_KEYS.ANSWERS, allAnswers);

    // Supabase persistence if logged in
    if (user && regId && !regId.startsWith('mock_')) {
      try {
        await supabase.from('practice_sessions').upsert({
          user_id: user.id,
          registration_id: regId,
          section,
          data: answers,
          meta: metadata,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to save answers to Supabase", err);
      }
    }
  },

  async saveResult(regId: string, scores: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const reg = getStorageItem(STORAGE_KEYS.REGISTRATION);
    const results = getStorageItem(STORAGE_KEYS.RESULTS, []);
    
    // Set 30 min ready time for non-mock real tests
    const readyAt = new Date();
    if (regId && !regId.startsWith('mock_')) {
      readyAt.setMinutes(readyAt.getMinutes() + 30);
    }
    
    const result: any = {
      id: user ? undefined : 'res_' + Date.now(),
      user_id: user?.id,
      roll_number: reg?.roll_number || 'UNKNOWN',
      listening_score: scores.listening,
      reading_score: scores.reading,
      writing_score: scores.writing,
      speaking_score: scores.speaking,
      overall_band: scores.overall,
      created_at: new Date().toISOString()
    };
    
    if (reg && regId && !regId.startsWith('mock_')) {
      reg.status = 'submitted';
      reg.result_ready_at = readyAt.toISOString();
      setStorageItem(STORAGE_KEYS.REGISTRATION, reg);
    }
    
    if (user) {
      try {
        if (regId && !regId.startsWith('mock_')) {
          const readyAt = new Date();
          readyAt.setMinutes(readyAt.getMinutes() + 30);
          
          const { error: updErr } = await supabase.from('test_registrations').update({ 
             status: 'submitted', 
             result_ready_at: readyAt.toISOString() 
          }).eq('id', regId);
          
          if (updErr) {
             console.error("Failed to update test registration to submitted:", updErr);
          }
        }

        const { data: saved, error } = await supabase.from('test_results').insert([
          {
            user_id: user.id,
            registration_id: (!regId || regId.startsWith('mock_')) ? null : regId,
            roll_number: result.roll_number,
            listening_score: scores.listening,
            reading_score: scores.reading,
            writing_score: scores.writing,
            speaking_score: scores.speaking,
            overall_band: scores.overall
          }
        ]).select().single();
        
        if (!error && saved) {
          results.push(saved);
          setStorageItem(STORAGE_KEYS.RESULTS, results);
        } else {
          throw error || new Error("Failed to save result to Supabase");
        }
      } catch (err) {
        console.error("Supabase result save failed, falling back to local only", err);
        results.push(result);
        setStorageItem(STORAGE_KEYS.RESULTS, results);
      }
    } else {
      results.push(result);
      setStorageItem(STORAGE_KEYS.RESULTS, results);
    }
    
    if (reg && reg.id === regId) {
      const readyAt = new Date();
      readyAt.setMinutes(readyAt.getMinutes() + 30);
      reg.status = 'submitted';
      reg.result_ready_at = readyAt.toISOString();
      setStorageItem(STORAGE_KEYS.REGISTRATION, reg);
    }
  },

  async savePracticeSession(practiceData: any) {
    const history = getStorageItem(STORAGE_KEYS.PRACTICE, []);
    history.push({
      id: 'prac_' + Date.now(),
      section: practiceData.section,
      duration_minutes: practiceData.duration,
      score: practiceData.overallBand,
      scores: practiceData.scores,
      ai_analysis: practiceData.aiAnalysis,
      created_at: new Date().toISOString()
    });
    setStorageItem(STORAGE_KEYS.PRACTICE, history);
  },

  async getPracticeHistory() {
    return getStorageItem(STORAGE_KEYS.PRACTICE, []);
  },

  async getTestResults() {
    return getStorageItem(STORAGE_KEYS.RESULTS, []);
  },

  async uploadAvatar(file: File, userId: string) {
    // Return a base64 for mock mode and sync with profiles table
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          // Sync with mock Supabase profiles table
          const { error } = await supabase.from('profiles').upsert({
            id: userId,
            avatar_url: base64,
            updated_at: new Date().toISOString()
          });
          
          if (error) {
            console.error("Supabase avatar save failed, using local storage", error);
            const localProfile = getStorageItem('ielts_mock_profile', {});
            localProfile.avatar_url = base64;
            setStorageItem('ielts_mock_profile', localProfile);
          }
          resolve(base64);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async uploadResume(file: File, userId: string) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const { error } = await supabase.from('profiles').upsert({
            id: userId,
            resume_url: base64,
            updated_at: new Date().toISOString()
          });
          
          if (error) {
            console.error("Supabase resume save failed, using local storage", error);
            const localProfile = getStorageItem('ielts_mock_profile', {});
            localProfile.resume_url = base64;
            setStorageItem('ielts_mock_profile', localProfile);
          }
          resolve(base64);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};
