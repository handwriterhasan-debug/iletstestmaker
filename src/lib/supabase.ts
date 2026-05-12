// Mock Supabase Client - Fully Disconnected but Persisted with LocalStorage
const mockAuth = {
  getSession: async () => {
    const mockSession = localStorage.getItem('ielts_mock_session');
    return { data: { session: mockSession ? JSON.parse(mockSession) : null }, error: null };
  },
  getUser: async () => {
    const mockUser = localStorage.getItem('ielts_mock_user');
    return { data: { user: mockUser ? JSON.parse(mockUser) : null }, error: null };
  },
  signInWithPassword: async () => ({ data: {}, error: null }),
  signUp: async () => ({ data: { user: { id: 'mock' } }, error: null }),
  signOut: async () => {
    localStorage.removeItem('ielts_mock_session');
    localStorage.removeItem('ielts_mock_user');
    return { error: null };
  },
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
};

const mockStorage = {
  from: () => ({
    upload: async () => ({ data: {}, error: null }),
    getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
  }),
};

// Helper for local mock DB
const getTableData = (table: string) => {
  const data = localStorage.getItem(`mock_db_${table}`);
  return data ? JSON.parse(data) : [];
};

const setTableData = (table: string, data: any[]) => {
  localStorage.setItem(`mock_db_${table}`, JSON.stringify(data));
};

const mockFrom = (table: string): any => {
  let queryData = getTableData(table);
  let filters: any[] = [];

  const self = {
    select: () => self,
    insert: (records: any) => {
      const current = getTableData(table);
      const newRecords = Array.isArray(records) ? records : [records];
      setTableData(table, [...current, ...newRecords]);
      return self;
    },
    update: (updates: any) => {
      let current = getTableData(table);
      current = current.map((row: any) => {
        let match = true;
        filters.forEach(f => {
          if (row[f.column] !== f.value) match = false;
        });
        return match ? { ...row, ...updates } : row;
      });
      setTableData(table, current);
      return self;
    },
    upsert: (record: any) => {
      const current = getTableData(table);
      const index = current.findIndex((r: any) => r.id === record.id);
      if (index > -1) {
        current[index] = { ...current[index], ...record };
      } else {
        current.push(record);
      }
      setTableData(table, current);
      return self;
    },
    delete: () => {
      let current = getTableData(table);
      current = current.filter((row: any) => {
        let match = true;
        filters.forEach(f => {
          if (row[f.column] !== f.value) match = false;
        });
        return !match;
      });
      setTableData(table, current);
      return self;
    },
    eq: (column: string, value: any) => {
      filters.push({ column, value });
      return self;
    },
    neq: (column: string, value: any) => self,
    gt: (column: string, value: any) => self,
    gte: (column: string, value: any) => self,
    lt: (column: string, value: any) => self,
    lte: (column: string, value: any) => self,
    like: (column: string, value: any) => self,
    ilike: (column: string, value: any) => self,
    is: (column: string, value: any) => self,
    in: (column: string, values: any[]) => self,
    contains: (column: string, value: any) => self,
    containedBy: (column: string, value: any) => self,
    range: (column: string, from: number, to: number) => self,
    order: () => self,
    limit: () => self,
    single: async () => {
      const data = getTableData(table);
      const filtered = data.find((row: any) => {
        return filters.every(f => row[f.column] === f.value);
      });
      return { data: filtered || null, error: null };
    },
    maybeSingle: async () => {
      const data = getTableData(table);
      const filtered = data.find((row: any) => {
        return filters.every(f => row[f.column] === f.value);
      });
      return { data: filtered || null, error: null };
    },
    then: (onfulfilled: any) => {
      const data = getTableData(table);
      const filtered = data.filter((row: any) => {
        return filters.every(f => row[f.column] === f.value);
      });
      return Promise.resolve({ data: filtered, error: null }).then(onfulfilled);
    },
  };
  return self;
};

export const supabase = {
  auth: mockAuth,
  storage: mockStorage,
  from: mockFrom,
  supabaseUrl: 'https://ais-mock-instance.supabase.co',
} as any;
