/** Interactive quest flow: lessons then challenges */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Check, X as XIcon } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Timer from '../components/Timer';
import { renderLessonContent } from '../utils/helpers';

export default function QuestPlayPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { refreshUser, user } = useAuth();
  const [quest, setQuest] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selected, setSelected] = useState(null);
  const [fillText, setFillText] = useState('');
  const [chTimerActive, setChTimerActive] = useState(false);
  const [finished, setFinished] = useState(null);
  const stepRef = useRef(0);

  const lessons = quest?.lessons || [];
  const challenges = quest?.challenges || [];
  const totalSteps = lessons.length + challenges.length;
  const isLesson = step < lessons.length;
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  const lesson = isLesson ? lessons[step] : null;
  const challenge = !isLesson ? challenges[step - lessons.length] : null;
  const chIndex = step - lessons.length;

  const load = useCallback(async () => {
    const { data } = await api.get(`/quests/${id}`);
    setQuest(data.quest);
    if (data.quest.progress?.status === 'AVAILABLE') {
      await api.post(`/quests/${id}/start`);
    }
  }, [id]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        await load();
      } catch {
        nav('/quests');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [load, nav]);

  useEffect(() => {
    setFeedback(null);
    setSelected(null);
    setFillText('');
    setChTimerActive(!!challenge);
  }, [step, challenge?.id]);

  const progressPct = totalSteps ? Math.round(((step + 1) / totalSteps) * 100) : 0;

  async function markLessonComplete(idx) {
    await api.post(`/quests/${id}/lesson-complete`, { lessonsCompleted: idx + 1 });
  }

  async function goNextLesson() {
    await markLessonComplete(step);
    if (step + 1 < totalSteps) setStep((s) => s + 1);
  }

  const totalChallenges = challenges.length;

  const submitAnswer = useCallback(
    async (answer, timeSpent) => {
      if (!challenge) return;
      setChTimerActive(false);
      try {
        const { data } = await api.post(`/challenges/${challenge.id}/submit`, {
          answer,
          timeSpent,
        });
        const nextCorrect = correctCount + (data.isCorrect ? 1 : 0);
        setCorrectCount(nextCorrect);
        setFeedback({ ...data, picked: answer });
        await refreshUser();

        const curStep = stepRef.current;
        const isLast = curStep + 1 >= totalSteps;

        window.setTimeout(async () => {
          if (isLast) {
            try {
              const res = await api.post(`/quests/${id}/complete`, {
                correctAnswers: nextCorrect,
                totalChallenges,
              });
              const d = res.data;
              if (d.newAchievements?.length) {
                d.newAchievements.forEach((a) => toast.success(`Achievement: ${a.name}!`));
              }
              if (d.leveledUp) toast.success(`Level ${d.newLevel}!`);
              await refreshUser();
              const pct = nextCorrect / totalChallenges;
              setFinished({
                stars: pct >= 0.9 ? 3 : pct >= 0.75 ? 2 : pct >= 0.5 ? 1 : 0,
                correct: nextCorrect,
                total: totalChallenges,
                xp: d.xpEarned,
                coins: d.coinsEarned,
                leveledUp: d.leveledUp,
                newLevel: d.newLevel,
              });
            } catch (e) {
              toast.error(e.response?.data?.error || 'Could not complete');
            }
          } else {
            setStep((s) => s + 1);
            setFeedback(null);
          }
        }, 3000);
      } catch (e) {
        toast.error(e.response?.data?.error || 'Submit failed');
      }
    },
    [challenge, correctCount, refreshUser, totalSteps, id, totalChallenges]
  );

  if (loading || !quest) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Loading…</div>;
  }

  if (finished) {
    const pct = Math.round((finished.correct / finished.total) * 100);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 p-6">
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-bold text-white">🎉 Quest Complete!</h2>
          <p className="mt-2 text-slate-300">{quest.title}</p>
          <div className="mt-6 flex justify-center gap-2 text-4xl">
            {[0, 1, 2].map((i) => (
              <span key={i} className={i < finished.stars ? 'text-amber-400' : 'text-slate-600'}>
                {i < finished.stars ? '⭐' : '☆'}
              </span>
            ))}
          </div>
          <p className="mt-4 text-slate-200">
            You got {finished.correct}/{finished.total} correct ({pct}%)
          </p>
          <p className="mt-2 text-xl text-green-400">+{finished.xp} XP</p>
          <p className="text-lg text-amber-400">+{finished.coins} Coins</p>
          {finished.leveledUp && (
            <p className="mt-2 animate-pulse text-amber-300">
              🎊 Level Up! You&apos;re now Level {finished.newLevel}!
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/quests"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Back to Quests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eq-dark pb-16">
      <div className="sticky top-0 z-30 border-b border-slate-700 bg-eq-dark/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button type="button" onClick={() => nav('/quests')} className="rounded-lg p-2 hover:bg-slate-800">
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex-1 text-center">
            <div className="text-sm font-semibold text-white">{quest.title}</div>
            <div className="text-xs text-slate-400">
              Step {step + 1} of {totalSteps}
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-700">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {isLesson && lesson && (
          <div key={lesson.id} className="lesson-slide-enter mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
            <div className="mt-4">{renderLessonContent(lesson.content)}</div>
            {lesson.key_terms?.length > 0 && (
              <div className="mt-6 rounded-xl border border-blue-600/30 bg-blue-900/30 p-4">
                <h3 className="font-semibold text-blue-200">📝 Key Terms</h3>
                <ul className="mt-2 space-y-2">
                  {lesson.key_terms.map((kt) => (
                    <li key={kt.term} className="text-slate-200">
                      <strong className="text-blue-300">{kt.term}:</strong> {kt.definition}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {lesson.fun_fact && (
              <div className="mt-4 rounded-xl border border-amber-600/30 bg-amber-900/30 p-4 text-amber-100">
                💡 Fun Fact: {lesson.fun_fact}
              </div>
            )}
            {lesson.real_world_example && (
              <div className="mt-4 rounded-xl border border-green-600/30 bg-green-900/30 p-4 text-green-100">
                🌍 Real World: {lesson.real_world_example}
              </div>
            )}
            <button
              type="button"
              onClick={goNextLesson}
              className="mt-8 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 sm:w-auto sm:px-8"
            >
              Next →
            </button>
          </div>
        )}

        {!isLesson && challenge && !feedback ? (
          <div className="mx-auto max-w-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200">
                {challenge.type.replace('_', ' ')}
              </span>
              <Timer
                seconds={challenge.time_limit || 30}
                active={chTimerActive}
                onExpire={() => submitAnswer('', challenge.time_limit || 30)}
              />
              <span className="text-xs text-slate-400">
                Lives:{' '}
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>{i < (user?.lives ?? 0) ? '❤️' : '🤍'}</span>
                ))}
              </span>
              <span className="text-xs text-green-400">+{challenge.xp_reward || 10} XP</span>
            </div>
            <h3 className="mt-6 text-center text-xl font-semibold text-white">{challenge.question}</h3>

            {challenge.type === 'MULTIPLE_CHOICE' || challenge.type === 'SCENARIO' ? (
              <div className="mt-6 space-y-3">
                {(challenge.options || []).map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelected(opt);
                        setTimeout(() => submitAnswer(opt, 10), 500);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left transition ${
                        selected === opt
                          ? 'border-blue-500 bg-blue-900/30'
                          : 'border-slate-600 bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-sm">
                        {letter}
                      </span>
                      <span className="text-slate-100">{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {challenge.type === 'TRUE_FALSE' ? (
              <div className="mt-6 grid grid-cols-2 gap-4">
                {['True', 'False'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={!!feedback}
                    onClick={() => {
                      setSelected(opt);
                      setTimeout(() => submitAnswer(opt, 8), 400);
                    }}
                    className={`rounded-xl py-6 text-lg font-semibold ${
                      opt === 'True'
                        ? 'bg-green-900/40 text-green-300 hover:bg-green-900/60'
                        : 'bg-red-900/40 text-red-300 hover:bg-red-900/60'
                    }`}
                  >
                    {opt === 'True' ? '✅ True' : '❌ False'}
                  </button>
                ))}
              </div>
            ) : null}

            {challenge.type === 'FILL_BLANK' ? (
              <div className="mt-6 space-y-3">
                <input
                  autoFocus
                  className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  value={fillText}
                  onChange={(e) => setFillText(e.target.value)}
                />
                <button
                  type="button"
                  disabled={!fillText.trim() || !!feedback}
                  onClick={() => submitAnswer(fillText.trim(), 15)}
                  className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
                >
                  Submit Answer
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {feedback && (
          <div
            className={`mx-auto mt-4 max-w-xl animate-slide-in-top rounded-xl p-4 ${
              feedback.isCorrect ? 'bg-green-900/40 text-green-200' : 'bg-red-900/40 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {feedback.isCorrect ? <Check /> : <XIcon />}
              {feedback.isCorrect
                ? `Correct! +${feedback.xpEarned} XP`
                : 'Incorrect'}
            </div>
            {!feedback.isCorrect && (
              <div className="mt-4 rounded-xl bg-slate-800 p-4 text-slate-200">
                <p>📖 Explanation: {feedback.explanation}</p>
                {challenge?.hint && (
                  <p className="mt-2">💡 Hint: {challenge.hint}</p>
                )}
              </div>
            )}
            <p className="mt-2 text-xs text-slate-400">Next in 3 seconds…</p>
          </div>
        )}
      </div>
    </div>
  );
}
