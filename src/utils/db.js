import { openDB } from 'idb';

const DB_NAME = 'sigma-green';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('studyRecord')) {
          db.createObjectStore('studyRecord', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('wrongQuestions')) {
          db.createObjectStore('wrongQuestions', { keyPath: 'questionId' });
        }
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('quizHistory')) {
          db.createObjectStore('quizHistory', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export async function getStudyStats() {
  const db = await getDB();
  const records = await db.getAll('studyRecord');
  const quizHistory = await db.getAll('quizHistory');
  const wrongQuestions = await db.getAll('wrongQuestions');
  const favorites = await db.getAll('favorites');

  const today = new Date().toDateString();
  const todayRecord = records.find(r => r.date === today);

  const totalQuestions = quizHistory.length;
  const correctCount = quizHistory.filter(q => q.correct).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const uniqueStudyDays = new Set(records.map(r => r.date)).size;

  const totalMinutes = records.reduce((sum, r) => sum + (r.duration || 0), 0);

  return {
    streak: calculateStreak(records),
    totalStudyDays: uniqueStudyDays,
    totalMinutes,
    completedKnowledge: todayRecord?.completedKnowledge || 0,
    totalQuestions,
    correctCount,
    accuracy,
    wrongCount: wrongQuestions.length,
    favoriteCount: favorites.length,
  };
}

function calculateStreak(records) {
  if (!records || records.length === 0) return 0;
  const dates = [...new Set(records.map(r => r.date))].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (dates[i] === expected.toDateString()) {
      streak++;
    } else if (i === 0 && dates[0] === new Date(today.setDate(today.getDate() - 1)).toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function recordStudySession(durationMinutes) {
  const db = await getDB();
  const today = new Date().toDateString();
  const existing = await db.getAll('studyRecord');
  const todayRecord = existing.find(r => r.date === today);

  if (todayRecord) {
    await db.put('studyRecord', {
      ...todayRecord,
      duration: (todayRecord.duration || 0) + durationMinutes,
    });
  } else {
    await db.add('studyRecord', {
      date: today,
      duration: durationMinutes,
      completedKnowledge: 0,
    });
  }
}

export async function markKnowledgeCompleted(knowledgeId) {
  const db = await getDB();
  const today = new Date().toDateString();
  const existing = await db.getAll('studyRecord');
  const todayRecord = existing.find(r => r.date === today);
  if (todayRecord) {
    await db.put('studyRecord', {
      ...todayRecord,
      completedKnowledge: (todayRecord.completedKnowledge || 0) + 1,
    });
  }
}

export async function addWrongQuestion(question) {
  const db = await getDB();
  const existing = await db.get('wrongQuestions', question.id);
  if (!existing) {
    await db.put('wrongQuestions', {
      questionId: question.id,
      question,
      wrongCount: 1,
      reviewed: false,
      createdAt: new Date().toISOString(),
    });
  } else {
    await db.put('wrongQuestions', {
      ...existing,
      wrongCount: existing.wrongCount + 1,
    });
  }
}

export async function removeWrongQuestion(questionId) {
  const db = await getDB();
  await db.delete('wrongQuestions', questionId);
}

export async function getWrongQuestions() {
  const db = await getDB();
  return db.getAll('wrongQuestions');
}

export async function getWrongQuestionsByCategory() {
  const wrong = await getWrongQuestions();
  const byCategory = {};
  wrong.forEach(w => {
    const cat = w.question.category || '其他';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });
  return byCategory;
}

export async function recordQuizResult(questionId, correct) {
  const db = await getDB();
  await db.add('quizHistory', {
    questionId,
    correct,
    timestamp: new Date().toISOString(),
  });
}

export async function addFavorite(knowledge) {
  const db = await getDB();
  await db.put('favorites', {
    id: knowledge.id,
    knowledge,
    createdAt: new Date().toISOString(),
  });
}

export async function removeFavorite(id) {
  const db = await getDB();
  await db.delete('favorites', id);
}

export async function isFavorite(id) {
  const db = await getDB();
  const item = await db.get('favorites', id);
  return !!item;
}

export async function getFavorites() {
  const db = await getDB();
  return db.getAll('favorites');
}

export async function getWrongQuestionIds() {
  const db = await getDB();
  const all = await db.getAll('wrongQuestions');
  return new Set(all.map(w => w.questionId));
}
