import 'react-native-get-random-values';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import * as db from '../database';
import { Task, Project, Tag, CalendarEvent, TimeBlock, Habit, Goal, Note, FocusSession, UserSettings, TaskFilter, Account, Transaction, Category, Budget } from '../types';

interface AppState {
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  events: CalendarEvent[];
  timeBlocks: TimeBlock[];
  habits: Habit[];
  goals: Goal[];
  notes: Note[];
  focusSessions: FocusSession[];
  settings: UserSettings;
  isLoading: boolean;
  initError: string | null;
  currentFilter: TaskFilter;
  searchQuery: string;
  
  initialize: () => Promise<void>;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  setTaskStatus: (id: string, status: Task['status']) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  
  addTag: (tag: Omit<Tag, 'id'>) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
  
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => Promise<void>;
  updateTimeBlock: (block: TimeBlock) => Promise<void>;
  removeTimeBlock: (id: string) => Promise<void>;
  
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completionHistory'>) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  completeHabit: (id: string, date: string) => Promise<void>;
  uncompleteHabit: (id: string, date: string) => Promise<void>;
  
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'progress'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  
  startFocusSession: (taskId?: string) => Promise<void>;
  endFocusSession: () => Promise<void>;
  
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  
  setFilter: (filter: TaskFilter) => void;
  setSearchQuery: (query: string) => void;
  
  getFilteredTasks: () => Task[];
  getTodayTasks: () => Task[];
  getOverdueTasks: () => Task[];

  // Finance
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  financeSummary: {
    totalIncome: number;
    totalExpenses: number;
    totalBalance: number;
    expensesByCategory: { category: string; total: number }[];
  };
  
  loadFinanceData: () => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;
}

const defaultSettings: UserSettings = {
  theme: 'system',
  notificationsEnabled: true,
  workHoursStart: '09:00',
  workHoursEnd: '18:00',
  timeFormat: '24h',
  defaultReminder: 15,
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
};

export const useStore = create<AppState>((set, get) => ({
  tasks: [],
  projects: [],
  tags: [],
  events: [],
  timeBlocks: [],
  habits: [],
  goals: [],
  notes: [],
  focusSessions: [],
  settings: defaultSettings,
  isLoading: true,
  initError: null,
  currentFilter: 'today',
  searchQuery: '',
  
  // Finance initial state
  accounts: [],
  transactions: [],
  categories: [],
  budgets: [],
  financeSummary: {
    totalIncome: 0,
    totalExpenses: 0,
    totalBalance: 0,
    expensesByCategory: [],
  },
  
  initialize: async () => {
    try {
      console.log('Initializing database...');
      await db.initDatabase();
      console.log('Loading data...');
      const [tasks, projects, tags, events, timeBlocks, habits, goals, notes, focusSessions, settings, accounts, transactions, categories, budgets, financeSummary] = await Promise.all([
        db.getTasks(),
        db.getProjects(),
        db.getTags(),
        db.getEvents(),
        db.getTimeBlocks(),
        db.getHabits(),
        db.getGoals(),
        db.getNotes(),
        db.getFocusSessions(),
        db.getSettings(),
        db.getAccounts(),
        db.getTransactions(),
        db.getCategories(),
        db.getBudgets(),
        db.getFinanceSummary(),
      ]);
      console.log('Tasks loaded:', tasks.length);
      set({ tasks, projects, tags, events, timeBlocks, habits, goals, notes, focusSessions, settings, isLoading: false, accounts, transactions, categories, budgets, financeSummary });
    } catch (error) {
      console.error('Failed to initialize database:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      set({ isLoading: false, initError: errorMessage });
    }
  },
  
  addTask: async (taskData) => {
    try {
      const now = dayjs().toISOString();
      const task: Task = {
        ...taskData,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };
      await db.createTask(task);
      set(state => ({ tasks: [...state.tasks, task] }));
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  },
  
  updateTask: async (task) => {
    const updatedTask = { ...task, updatedAt: dayjs().toISOString() };
    await db.updateTask(updatedTask);
    set(state => ({
      tasks: state.tasks.map(t => t.id === task.id ? updatedTask : t),
    }));
  },
  
  removeTask: async (id) => {
    await db.deleteTask(id);
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
  },
  
  setTaskStatus: async (id, status) => {
    const task = get().tasks.find(t => t.id === id);
    if (task) {
      const updatedTask = { ...task, status, updatedAt: dayjs().toISOString() };
      await db.updateTask(updatedTask);
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
      }));
    }
  },
  
  toggleSubtask: async (taskId, subtaskId) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (task) {
      const subtasks = task.subtasks.map(s => 
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      );
      const completedCount = subtasks.filter(s => s.completed).length;
      const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;
      const updatedTask = { ...task, subtasks, updatedAt: dayjs().toISOString() };
      await db.updateTask(updatedTask);
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
      }));
    }
  },
  
  addProject: async (projectData) => {
    const project: Project = {
      ...projectData,
      id: uuidv4(),
      createdAt: dayjs().toISOString(),
    };
    await db.createProject(project);
    set(state => ({ projects: [...state.projects, project] }));
  },
  
  updateProject: async (project) => {
    await db.updateProject(project);
    set(state => ({
      projects: state.projects.map(p => p.id === project.id ? project : p),
    }));
  },
  
  removeProject: async (id) => {
    await db.deleteProject(id);
    set(state => ({ projects: state.projects.filter(p => p.id !== id) }));
  },
  
  addTag: async (tagData) => {
    const tag: Tag = { ...tagData, id: uuidv4() };
    await db.createTag(tag);
    set(state => ({ tags: [...state.tags, tag] }));
  },
  
  removeTag: async (id) => {
    await db.deleteTag(id);
    set(state => ({ tags: state.tags.filter(t => t.id !== id) }));
  },
  
  addEvent: async (eventData) => {
    const event: CalendarEvent = {
      ...eventData,
      id: uuidv4(),
      createdAt: dayjs().toISOString(),
    };
    await db.createEvent(event);
    set(state => ({ events: [...state.events, event] }));
  },
  
  updateEvent: async (event) => {
    await db.updateEvent(event);
    set(state => ({
      events: state.events.map(e => e.id === event.id ? event : e),
    }));
  },
  
  removeEvent: async (id) => {
    await db.deleteEvent(id);
    set(state => ({ events: state.events.filter(e => e.id !== id) }));
  },
  
  addTimeBlock: async (blockData) => {
    const block: TimeBlock = { ...blockData, id: uuidv4() };
    await db.createTimeBlock(block);
    set(state => ({ timeBlocks: [...state.timeBlocks, block] }));
  },
  
  updateTimeBlock: async (block) => {
    await db.updateTimeBlock(block);
    set(state => ({
      timeBlocks: state.timeBlocks.map(b => b.id === block.id ? block : b),
    }));
  },
  
  removeTimeBlock: async (id) => {
    await db.deleteTimeBlock(id);
    set(state => ({ timeBlocks: state.timeBlocks.filter(b => b.id !== id) }));
  },
  
  addHabit: async (habitData) => {
    const habit: Habit = {
      ...habitData,
      id: uuidv4(),
      createdAt: dayjs().toISOString(),
      streak: 0,
      completionHistory: [],
    };
    await db.createHabit(habit);
    set(state => ({ habits: [...state.habits, habit] }));
  },
  
  updateHabit: async (habit) => {
    await db.updateHabit(habit);
    set(state => ({
      habits: state.habits.map(h => h.id === habit.id ? habit : h),
    }));
  },
  
  removeHabit: async (id) => {
    await db.deleteHabit(id);
    set(state => ({ habits: state.habits.filter(h => h.id !== id) }));
  },
  
  completeHabit: async (id, date) => {
    const habit = get().habits.find(h => h.id === id);
    if (habit && !habit.completionHistory.includes(date)) {
      const completionHistory = [...habit.completionHistory, date];
      const streak = calculateStreak(completionHistory, habit.frequency, habit.frequencyDays);
      const updatedHabit = { ...habit, completionHistory, streak };
      await db.updateHabit(updatedHabit);
      set(state => ({
        habits: state.habits.map(h => h.id === id ? updatedHabit : h),
      }));
    }
  },
  
  uncompleteHabit: async (id, date) => {
    const habit = get().habits.find(h => h.id === id);
    if (habit) {
      const completionHistory = habit.completionHistory.filter(d => d !== date);
      const streak = calculateStreak(completionHistory, habit.frequency, habit.frequencyDays);
      const updatedHabit = { ...habit, completionHistory, streak };
      await db.updateHabit(updatedHabit);
      set(state => ({
        habits: state.habits.map(h => h.id === id ? updatedHabit : h),
      }));
    }
  },
  
  addGoal: async (goalData) => {
    const goal: Goal = {
      ...goalData,
      id: uuidv4(),
      createdAt: dayjs().toISOString(),
      progress: 0,
    };
    await db.createGoal(goal);
    set(state => ({ goals: [...state.goals, goal] }));
  },
  
  updateGoal: async (goal) => {
    await db.updateGoal(goal);
    set(state => ({
      goals: state.goals.map(g => g.id === goal.id ? goal : g),
    }));
  },
  
  removeGoal: async (id) => {
    await db.deleteGoal(id);
    set(state => ({ goals: state.goals.filter(g => g.id !== id) }));
  },
  
  addNote: async (noteData) => {
    const now = dayjs().toISOString();
    const note: Note = {
      ...noteData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.createNote(note);
    set(state => ({ notes: [...state.notes, note] }));
  },
  
  updateNote: async (note) => {
    const updatedNote = { ...note, updatedAt: dayjs().toISOString() };
    await db.updateNote(updatedNote);
    set(state => ({
      notes: state.notes.map(n => n.id === note.id ? updatedNote : n),
    }));
  },
  
  removeNote: async (id) => {
    await db.deleteNote(id);
    set(state => ({ notes: state.notes.filter(n => n.id !== id) }));
  },
  
  startFocusSession: async (taskId) => {
    const session: FocusSession = {
      id: uuidv4(),
      startTime: dayjs().toISOString(),
      endTime: null,
      duration: 0,
      taskId: taskId || null,
    };
    await db.createFocusSession(session);
    set(state => ({ focusSessions: [...state.focusSessions, session] }));
  },
  
  endFocusSession: async () => {
    const sessions = get().focusSessions;
    const activeSession = sessions.find(s => !s.endTime);
    if (activeSession) {
      const endTime = dayjs().toISOString();
      const duration = dayjs(endTime).diff(dayjs(activeSession.startTime), 'minute');
      const updatedSession = { ...activeSession, endTime, duration };
      await db.updateFocusSession(updatedSession);
      set(state => ({
        focusSessions: state.focusSessions.map(s => s.id === activeSession.id ? updatedSession : s),
      }));
    }
  },
  
  updateSettings: async (newSettings) => {
    const currentSettings = get().settings;
    const updatedSettings = { ...currentSettings, ...newSettings };
    await db.updateSettings(newSettings);
    set({ settings: updatedSettings });
  },
  
  setFilter: (filter) => set({ currentFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  getFilteredTasks: () => {
    const { tasks, currentFilter, searchQuery } = get();
    let filtered = tasks;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query)
      );
    }
    
    switch (currentFilter) {
      case 'today':
        return filtered.filter(t => {
          if (!t.dueDate) return false;
          return dayjs(t.dueDate).isSame(dayjs(), 'day') && t.status !== 'archived';
        });
      case 'tomorrow':
        return filtered.filter(t => {
          if (!t.dueDate) return false;
          return dayjs(t.dueDate).isSame(dayjs().add(1, 'day'), 'day') && t.status !== 'archived';
        });
      case 'week':
        return filtered.filter(t => {
          if (!t.dueDate) return false;
          return dayjs(t.dueDate).isAfter(dayjs()) && 
                 dayjs(t.dueDate).isBefore(dayjs().add(7, 'day')) && 
                 t.status !== 'archived';
        });
      case 'no-date':
        return filtered.filter(t => !t.dueDate && t.status !== 'archived');
      case 'overdue':
        return filtered.filter(t => {
          if (!t.dueDate) return false;
          return dayjs(t.dueDate).isBefore(dayjs(), 'day') && t.status !== 'done' && t.status !== 'archived';
        });
      case 'high-priority':
        return filtered.filter(t => (t.priority === 'high' || t.priority === 'critical') && t.status !== 'archived');
      default:
        return filtered.filter(t => t.status !== 'archived');
    }
  },
  
  getTodayTasks: () => {
    const { tasks } = get();
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      return dayjs(t.dueDate).isSame(dayjs(), 'day') && t.status !== 'archived';
    });
  },
  
  getOverdueTasks: () => {
    const { tasks } = get();
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      return dayjs(t.dueDate).isBefore(dayjs(), 'day') && t.status !== 'done' && t.status !== 'archived';
    });
  },

  // Finance functions
  loadFinanceData: async () => {
    try {
      const [accounts, transactions, categories, budgets, financeSummary] = await Promise.all([
        db.getAccounts(),
        db.getTransactions(),
        db.getCategories(),
        db.getBudgets(),
        db.getFinanceSummary(),
      ]);
      set({ accounts, transactions, categories, budgets, financeSummary });
    } catch (error) {
      console.error('Failed to load finance data:', error);
    }
  },

  addAccount: async (accountData) => {
    const now = dayjs().toISOString();
    const account: Account = {
      ...accountData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.createAccount(account);
    set(state => ({ accounts: [...state.accounts, account] }));
    get().loadFinanceData();
  },

  updateAccount: async (account) => {
    const updatedAccount = { ...account, updatedAt: dayjs().toISOString() };
    await db.updateAccount(updatedAccount);
    set(state => ({
      accounts: state.accounts.map(a => a.id === account.id ? updatedAccount : a),
    }));
    get().loadFinanceData();
  },

  removeAccount: async (id) => {
    await db.deleteAccount(id);
    set(state => ({ accounts: state.accounts.filter(a => a.id !== id) }));
    get().loadFinanceData();
  },

  addTransaction: async (transactionData) => {
    const now = dayjs().toISOString();
    const transaction: Transaction = {
      ...transactionData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.createTransaction(transaction);
    set(state => ({ transactions: [transaction, ...state.transactions] }));
    get().loadFinanceData();
  },

  updateTransaction: async (transaction) => {
    const updatedTransaction = { ...transaction, updatedAt: dayjs().toISOString() };
    await db.updateTransaction(updatedTransaction);
    set(state => ({
      transactions: state.transactions.map(t => t.id === transaction.id ? updatedTransaction : t),
    }));
    get().loadFinanceData();
  },

  removeTransaction: async (id) => {
    await db.deleteTransaction(id);
    set(state => ({ transactions: state.transactions.filter(t => t.id !== id) }));
    get().loadFinanceData();
  },

  addCategory: async (categoryData) => {
    const category: Category = {
      ...categoryData,
      id: uuidv4(),
    };
    await db.createCategory(category);
    set(state => ({ categories: [...state.categories, category] }));
  },

  removeCategory: async (id) => {
    await db.deleteCategory(id);
    set(state => ({ categories: state.categories.filter(c => c.id !== id) }));
  },

  addBudget: async (budgetData) => {
    const budget: Budget = {
      ...budgetData,
      id: uuidv4(),
      createdAt: dayjs().toISOString(),
    };
    await db.createBudget(budget);
    set(state => ({ budgets: [...state.budgets, budget] }));
  },

  updateBudget: async (budget) => {
    await db.updateBudget(budget);
    set(state => ({
      budgets: state.budgets.map(b => b.id === budget.id ? budget : b),
    }));
  },

  removeBudget: async (id) => {
    await db.deleteBudget(id);
    set(state => ({ budgets: state.budgets.filter(b => b.id !== id) }));
  },
}));

function calculateStreak(completionHistory: string[], frequency: Habit['frequency'], frequencyDays: number[]): number {
  if (completionHistory.length === 0) return 0;
  
  const sortedDates = [...completionHistory].sort().reverse();
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;
  
  let streak = 1;
  let currentDate = dayjs(sortedDates[0]);
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = currentDate;
    currentDate = dayjs(sortedDates[i]);
    const diff = prevDate.diff(currentDate, 'day');
    
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
