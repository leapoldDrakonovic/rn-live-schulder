import * as SQLite from 'expo-sqlite';
import { Task, Project, Tag, CalendarEvent, TimeBlock, Habit, Goal, Note, FocusSession, UserSettings } from '../types';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const safeJSON = <T>(value: string | null | undefined, defaultValue: T): T => {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('scheduler.db');
  }
  return dbPromise;
};

export const initDatabase = async (): Promise<void> => {
  try {
    const db = await getDatabase();

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        dueDate TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'inbox',
        tags TEXT DEFAULT '[]',
        projectId TEXT,
        repeatRule TEXT,
        reminder TEXT,
        estimatedTime INTEGER,
        actualTime INTEGER,
        energyLevelRequired INTEGER,
        subtasks TEXT DEFAULT '[]'
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        color TEXT DEFAULT '#007AFF',
        createdAt TEXT NOT NULL
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#007AFF'
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        location TEXT DEFAULT '',
        category TEXT DEFAULT 'other',
        participants TEXT DEFAULT '[]',
        reminders TEXT DEFAULT '[]',
        repeatRule TEXT,
        createdAt TEXT NOT NULL
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS time_blocks (
        id TEXT PRIMARY KEY NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        type TEXT DEFAULT 'focus',
        linkedTaskId TEXT,
        date TEXT NOT NULL
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        frequency TEXT DEFAULT 'daily',
        frequencyDays TEXT DEFAULT '[]',
        streak INTEGER DEFAULT 0,
        completionHistory TEXT DEFAULT '[]',
        reminders TEXT DEFAULT '[]',
        difficulty TEXT DEFAULT 'medium',
        createdAt TEXT NOT NULL
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        category TEXT DEFAULT '',
        type TEXT DEFAULT 'yearly',
        deadline TEXT NOT NULL,
        milestones TEXT DEFAULT '[]',
        progress INTEGER DEFAULT 0,
        linkedTasks TEXT DEFAULT '[]',
        createdAt TEXT NOT NULL
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT DEFAULT '',
        linkedTaskId TEXT,
        linkedGoalId TEXT,
        tags TEXT DEFAULT '[]',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT,
        duration INTEGER DEFAULT 0,
        taskId TEXT
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        theme TEXT DEFAULT 'system',
        notificationsEnabled INTEGER DEFAULT 1,
        workHoursStart TEXT DEFAULT '09:00',
        workHoursEnd TEXT DEFAULT '18:00',
        timeFormat TEXT DEFAULT '24h',
        defaultReminder INTEGER DEFAULT 15,
        pomodoroDuration INTEGER DEFAULT 25,
        shortBreakDuration INTEGER DEFAULT 5,
        longBreakDuration INTEGER DEFAULT 15
      )
    `);

    await db.execAsync('INSERT OR IGNORE INTO settings (id) VALUES (1)');
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const getTasks = async (): Promise<Task[]> => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync<any>('SELECT * FROM tasks ORDER BY dueDate ASC');
    return result.map(row => ({
      ...row,
      tags: safeJSON<string[]>(row.tags, []),
      repeatRule: safeJSON(row.repeatRule, null),
      reminder: safeJSON(row.reminder, null),
      subtasks: safeJSON<any[]>(row.subtasks, []),
    }));
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  try {
    const database = await getDatabase();
    const result = await database.getFirstAsync<any>('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!result) return null;
    return {
      ...result,
      tags: safeJSON<string[]>(result.tags, []),
      repeatRule: safeJSON(result.repeatRule, null),
      reminder: safeJSON(result.reminder, null),
      subtasks: safeJSON<any[]>(result.subtasks, []),
    };
  } catch (error) {
    console.error('Error getting task by id:', error);
    return null;
  }
};

export const createTask = async (task: Task): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      `INSERT INTO tasks (id, title, description, createdAt, updatedAt, dueDate, priority, status, tags, projectId, repeatRule, reminder, estimatedTime, actualTime, energyLevelRequired, subtasks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.title,
        task.description,
        task.createdAt,
        task.updatedAt,
        task.dueDate,
        task.priority,
        task.status,
        JSON.stringify(task.tags),
        task.projectId,
        task.repeatRule ? JSON.stringify(task.repeatRule) : null,
        task.reminder ? JSON.stringify(task.reminder) : null,
        task.estimatedTime,
        task.actualTime,
        task.energyLevelRequired,
        JSON.stringify(task.subtasks),
      ]
    );
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (task: Task): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      `UPDATE tasks SET title = ?, description = ?, updatedAt = ?, dueDate = ?, priority = ?, status = ?, tags = ?, projectId = ?, repeatRule = ?, reminder = ?, estimatedTime = ?, actualTime = ?, energyLevelRequired = ?, subtasks = ? WHERE id = ?`,
      [
        task.title,
        task.description,
        task.updatedAt,
        task.dueDate,
        task.priority,
        task.status,
        JSON.stringify(task.tags),
        task.projectId,
        task.repeatRule ? JSON.stringify(task.repeatRule) : null,
        task.reminder ? JSON.stringify(task.reminder) : null,
        task.estimatedTime,
        task.actualTime,
        task.energyLevelRequired,
        JSON.stringify(task.subtasks),
        task.id,
      ]
    );
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const database = await getDatabase();
    return await database.getAllAsync<Project>('SELECT * FROM projects ORDER BY title ASC');
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
};

export const createProject = async (project: Project): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'INSERT INTO projects (id, title, description, color, createdAt) VALUES (?, ?, ?, ?, ?)',
      [project.id, project.title, project.description, project.color, project.createdAt]
    );
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (project: Project): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'UPDATE projects SET title = ?, description = ?, color = ? WHERE id = ?',
      [project.title, project.description, project.color, project.id]
    );
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM projects WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const getTags = async (): Promise<Tag[]> => {
  try {
    const database = await getDatabase();
    return await database.getAllAsync<Tag>('SELECT * FROM tags ORDER BY name ASC');
  } catch (error) {
    console.error('Error getting tags:', error);
    return [];
  }
};

export const createTag = async (tag: Tag): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync('INSERT INTO tags (id, name, color) VALUES (?, ?, ?)', [tag.id, tag.name, tag.color]);
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

export const deleteTag = async (id: string): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM tags WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};

export const getEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync<any>('SELECT * FROM events ORDER BY startTime ASC');
    return result.map(row => ({
      ...row,
      participants: safeJSON<string[]>(row.participants, []),
      reminders: safeJSON<number[]>(row.reminders, []),
      repeatRule: safeJSON(row.repeatRule, null),
    }));
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
};

export const createEvent = async (event: CalendarEvent): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      `INSERT INTO events (id, title, description, startTime, endTime, location, category, participants, reminders, repeatRule, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.id,
        event.title,
        event.description,
        event.startTime,
        event.endTime,
        event.location,
        event.category,
        JSON.stringify(event.participants),
        JSON.stringify(event.reminders),
        event.repeatRule ? JSON.stringify(event.repeatRule) : null,
        event.createdAt,
      ]
    );
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (event: CalendarEvent): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      `UPDATE events SET title = ?, description = ?, startTime = ?, endTime = ?, location = ?, category = ?, participants = ?, reminders = ?, repeatRule = ? WHERE id = ?`,
      [
        event.title,
        event.description,
        event.startTime,
        event.endTime,
        event.location,
        event.category,
        JSON.stringify(event.participants),
        JSON.stringify(event.reminders),
        event.repeatRule ? JSON.stringify(event.repeatRule) : null,
        event.id,
      ]
    );
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (id: string): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM events WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const getTimeBlocks = async (date?: string): Promise<TimeBlock[]> => {
  try {
    const database = await getDatabase();
    if (date) {
      return await database.getAllAsync<TimeBlock>('SELECT * FROM time_blocks WHERE date = ? ORDER BY startTime ASC', [date]);
    }
    return await database.getAllAsync<TimeBlock>('SELECT * FROM time_blocks ORDER BY date ASC, startTime ASC');
  } catch (error) {
    console.error('Error getting time blocks:', error);
    return [];
  }
};

export const createTimeBlock = async (block: TimeBlock): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'INSERT INTO time_blocks (id, startTime, endTime, type, linkedTaskId, date) VALUES (?, ?, ?, ?, ?, ?)',
      [block.id, block.startTime, block.endTime, block.type, block.linkedTaskId, block.date]
    );
  } catch (error) {
    console.error('Error creating time block:', error);
    throw error;
  }
};

export const updateTimeBlock = async (block: TimeBlock): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'UPDATE time_blocks SET startTime = ?, endTime = ?, type = ?, linkedTaskId = ?, date = ? WHERE id = ?',
      [block.startTime, block.endTime, block.type, block.linkedTaskId, block.date, block.id]
    );
  } catch (error) {
    console.error('Error updating time block:', error);
    throw error;
  }
};

export const deleteTimeBlock = async (id: string): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM time_blocks WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting time block:', error);
    throw error;
  }
};

export const getHabits = async (): Promise<Habit[]> => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync<any>('SELECT * FROM habits ORDER BY createdAt DESC');
    return result.map(row => ({
      ...row,
      frequencyDays: safeJSON<string[]>(row.frequencyDays, []),
      completionHistory: safeJSON<string[]>(row.completionHistory, []),
      reminders: safeJSON<any[]>(row.reminders, []),
    }));
  } catch (error) {
    console.error('Error getting habits:', error);
    return [];
  }
};

export const createHabit = async (habit: Habit): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      `INSERT INTO habits (id, title, frequency, frequencyDays, streak, completionHistory, reminders, difficulty, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        habit.id,
        habit.title,
        habit.frequency,
        JSON.stringify(habit.frequencyDays),
        habit.streak,
        JSON.stringify(habit.completionHistory),
        JSON.stringify(habit.reminders),
        habit.difficulty,
        habit.createdAt,
      ]
    );
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
};

export const updateHabit = async (habit: Habit): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      `UPDATE habits SET title = ?, frequency = ?, frequencyDays = ?, streak = ?, completionHistory = ?, reminders = ?, difficulty = ? WHERE id = ?`,
      [
        habit.title,
        habit.frequency,
        JSON.stringify(habit.frequencyDays),
        habit.streak,
        JSON.stringify(habit.completionHistory),
        JSON.stringify(habit.reminders),
        habit.difficulty,
        habit.id,
      ]
    );
  } catch (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};

export const deleteHabit = async (id: string): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM habits WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
};

export const getGoals = async (): Promise<Goal[]> => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync<any>('SELECT * FROM goals ORDER BY deadline ASC');
    return result.map(row => ({
      ...row,
      milestones: safeJSON<any[]>(row.milestones, []),
      linkedTasks: safeJSON<string[]>(row.linkedTasks, []),
    }));
  } catch (error) {
    console.error('Error getting goals:', error);
    return [];
  }
};

export const createGoal = async (goal: Goal): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      `INSERT INTO goals (id, title, description, category, type, deadline, milestones, progress, linkedTasks, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        goal.id,
        goal.title,
        goal.description,
        goal.category,
        goal.type,
        goal.deadline,
        JSON.stringify(goal.milestones),
        goal.progress,
        JSON.stringify(goal.linkedTasks),
        goal.createdAt,
      ]
    );
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

export const updateGoal = async (goal: Goal): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      `UPDATE goals SET title = ?, description = ?, category = ?, type = ?, deadline = ?, milestones = ?, progress = ?, linkedTasks = ? WHERE id = ?`,
      [
        goal.title,
        goal.description,
        goal.category,
        goal.type,
        goal.deadline,
        JSON.stringify(goal.milestones),
        goal.progress,
        JSON.stringify(goal.linkedTasks),
        goal.id,
      ]
    );
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (id: string): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM goals WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

export const getNotes = async (): Promise<Note[]> => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync<any>('SELECT * FROM notes ORDER BY updatedAt DESC');
    return result.map(row => ({
      ...row,
      tags: safeJSON<string[]>(row.tags, []),
    }));
  } catch (error) {
    console.error('Error getting notes:', error);
    return [];
  }
};

export const createNote = async (note: Note): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'INSERT INTO notes (id, title, content, linkedTaskId, linkedGoalId, tags, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [note.id, note.title, note.content, note.linkedTaskId, note.linkedGoalId, JSON.stringify(note.tags), note.createdAt, note.updatedAt]
    );
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

export const updateNote = async (note: Note): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'UPDATE notes SET title = ?, content = ?, linkedTaskId = ?, linkedGoalId = ?, tags = ?, updatedAt = ? WHERE id = ?',
      [note.title, note.content, note.linkedTaskId, note.linkedGoalId, JSON.stringify(note.tags), note.updatedAt, note.id]
    );
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

export const deleteNote = async (id: string): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM notes WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

export const getFocusSessions = async (): Promise<FocusSession[]> => {
  try {
    const database = await getDatabase();
    return await database.getAllAsync<FocusSession>('SELECT * FROM focus_sessions ORDER BY startTime DESC');
  } catch (error) {
    console.error('Error getting focus sessions:', error);
    return [];
  }
};

export const createFocusSession = async (session: FocusSession): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'INSERT INTO focus_sessions (id, startTime, endTime, duration, taskId) VALUES (?, ?, ?, ?, ?)',
      [session.id, session.startTime, session.endTime, session.duration, session.taskId]
    );
  } catch (error) {
    console.error('Error creating focus session:', error);
    throw error;
  }
};

export const updateFocusSession = async (session: FocusSession): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'UPDATE focus_sessions SET endTime = ?, duration = ? WHERE id = ?',
      [session.endTime, session.duration, session.id]
    );
  } catch (error) {
    console.error('Error updating focus session:', error);
    throw error;
  }
};

export const getSettings = async (): Promise<UserSettings> => {
  try {
    const database = await getDatabase();
    const result = await database.getFirstAsync<any>('SELECT * FROM settings WHERE id = 1');
    if (!result) {
      return {
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
    }
    return {
      theme: result.theme,
      notificationsEnabled: Boolean(result.notificationsEnabled),
      workHoursStart: result.workHoursStart,
      workHoursEnd: result.workHoursEnd,
      timeFormat: result.timeFormat,
      defaultReminder: result.defaultReminder,
      pomodoroDuration: result.pomodoroDuration,
      shortBreakDuration: result.shortBreakDuration,
      longBreakDuration: result.longBreakDuration,
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
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
  }
};

export const updateSettings = async (settings: Partial<UserSettings>): Promise<void> => {
  try {
    const database = await getDatabase();
    const updates: string[] = [];
    const values: any[] = [];
    
    if (settings.theme !== undefined) {
      updates.push('theme = ?');
      values.push(settings.theme);
    }
    if (settings.notificationsEnabled !== undefined) {
      updates.push('notificationsEnabled = ?');
      values.push(settings.notificationsEnabled ? 1 : 0);
    }
    if (settings.workHoursStart !== undefined) {
      updates.push('workHoursStart = ?');
      values.push(settings.workHoursStart);
    }
    if (settings.workHoursEnd !== undefined) {
      updates.push('workHoursEnd = ?');
      values.push(settings.workHoursEnd);
    }
    if (settings.timeFormat !== undefined) {
      updates.push('timeFormat = ?');
      values.push(settings.timeFormat);
    }
    if (settings.defaultReminder !== undefined) {
      updates.push('defaultReminder = ?');
      values.push(settings.defaultReminder);
    }
    if (settings.pomodoroDuration !== undefined) {
      updates.push('pomodoroDuration = ?');
      values.push(settings.pomodoroDuration);
    }
    if (settings.shortBreakDuration !== undefined) {
      updates.push('shortBreakDuration = ?');
      values.push(settings.shortBreakDuration);
    }
    if (settings.longBreakDuration !== undefined) {
      updates.push('longBreakDuration = ?');
      values.push(settings.longBreakDuration);
    }
    
    if (updates.length > 0) {
      await database.runAsync(`UPDATE settings SET ${updates.join(', ')} WHERE id = 1`, values);
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};
