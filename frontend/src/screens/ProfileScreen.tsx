import React, { useState, useEffect } from 'react';
import { User, UniversityItem, UniversityLeaderboardItem, StudentLeaderboardItem } from '../types/game';
import { api } from '../services/api';
import { hapticImpact, hapticNotification } from '../services/telegram';
import { Award, CheckCircle, Share2, Flame, Trophy, Users, Edit3, X, Crown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProfileScreenProps {
  user: User;
  onUpdateUser: (updated: User) => void;
}

type TabType = 'unis' | 'students' | 'skills';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<TabType>('unis');
  const [uniLeaderboard, setUniLeaderboard] = useState<UniversityLeaderboardItem[]>([]);
  const [studentLeaderboard, setStudentLeaderboard] = useState<StudentLeaderboardItem[]>([]);
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [isEditUniOpen, setIsEditUniOpen] = useState<boolean>(false);
  const [selectedUni, setSelectedUni] = useState<string>(user.university);
  const [selectedFaculty, setSelectedFaculty] = useState<string>(user.faculty);
  const [loading, setLoading] = useState<boolean>(true);
  const [shareClaimed, setShareClaimed] = useState<boolean>(false);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    try {
      setLoading(true);
      const [unis, uniBoard, studentBoard] = await Promise.all([
        api.getUniversities(),
        api.getUniversityLeaderboard(),
        api.getStudentLeaderboard(user.telegram_id),
      ]);
      setUniversities(unis);
      setUniLeaderboard(uniBoard);
      setStudentLeaderboard(studentBoard);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUniversity = async () => {
    try {
      hapticImpact('heavy');
      const res = await api.setUserUniversity(user.telegram_id, selectedUni, selectedFaculty);
      hapticNotification('success');
      onUpdateUser({
        ...user,
        university: res.university,
        faculty: res.faculty,
      });
      setIsEditUniOpen(false);
      await loadSocialData();
    } catch (e: any) {
      alert(e.message || 'Ошибка смены ВУЗа');
    }
  };

  const handleShare = async () => {
    hapticImpact('heavy');
    hapticNotification('success');
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    const shareText = `Я обучаю свою нейросеть ${user.pet?.name || 'NeuroPet'} на скучных парах! Залетай ко мне в кластер ${user.university} (${user.faculty})!`;
    const tgUrl = `https://t.me/share/url?url=https://t.me/NeuroPetBot&text=${encodeURIComponent(shareText)}`;
    window.open(tgUrl, '_blank');

    if (!shareClaimed) {
      try {
        const res = await api.claimShareReward(user.telegram_id);
        setShareClaimed(true);
        onUpdateUser({
          ...user,
          compute_tokens: res.new_balance,
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const topics = [
    { title: 'Разметка данных и классификация', done: true, desc: 'Фильтрация спама и детекция сгенерированного AI' },
    { title: 'Градиентный спуск и Learning Rate', done: user.pet && user.pet.epoch > 1, desc: 'Подбор шага оптимизации и борьба с переобучением' },
    { title: 'Neural Forge & Сверточные блоки', done: true, desc: 'Экипировка модулей и оптимизация архитектуры' },
    { title: 'Server Raid & AI Prompt Jailbreak', done: user.pet && user.pet.level >= 2, desc: 'Обход защитных фаерволов техниками социнженерии' },
  ];

  const currentUniObj = universities.find((u) => u.name === selectedUni) || universities[0];

  return (
    <div className="flex flex-col gap-4 pb-24 px-4 pt-2 max-w-md mx-auto">
      {/* Карточка Студента */}
      <div className="bg-cyber-card border border-cyber-border p-4 rounded-3xl space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.first_name ? user.first_name[0] : 'S'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{user.first_name || 'Студент'}</span>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded font-mono">
                  Ур. {user.pet?.level || 1}
                </span>
              </h2>
              <p className="text-[11px] text-gray-400 font-mono">@{user.username || 'tg_student'}</p>
            </div>
          </div>

          <button
            onClick={() => {
              hapticImpact('light');
              setIsEditUniOpen(true);
            }}
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-500/40 px-2.5 py-1 rounded-xl"
          >
            <Edit3 size={12} />
            <span>ВУЗ</span>
          </button>
        </div>

        {/* Инфо о ВУЗе и посещаемости */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-cyber-border/60">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-gray-400 block">Кластер:</span>
            <span className="text-white font-bold truncate block">{user.university}</span>
            <span className="text-[10px] text-cyan-400 block truncate">{user.faculty}</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-gray-400 block">Посещаемость:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Flame size={14} className="fill-amber-400" /> {user.streak_days} дн. подряд
            </span>
            <span className="text-[10px] text-gray-400 block">Дневной стрик</span>
          </div>
        </div>

        {/* Кнопка приглашения в чат группы */}
        <button
          onClick={handleShare}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 hover:border-cyan-400 rounded-2xl text-xs font-bold text-cyan-300 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
        >
          <Share2 size={14} />
          <span>Позвать одногруппников (+150 FLOP)</span>
        </button>
      </div>

      {/* Переключатель Табов Рейтингов */}
      <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-cyber-border">
        <button
          onClick={() => {
            hapticImpact('light');
            setActiveTab('unis');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'unis'
              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Trophy size={14} />
          <span>Битва ВУЗов</span>
        </button>

        <button
          onClick={() => {
            hapticImpact('light');
            setActiveTab('students');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'students'
              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users size={14} />
          <span>Топ Студентов</span>
        </button>

        <button
          onClick={() => {
            hapticImpact('light');
            setActiveTab('skills');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'skills'
              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Award size={14} />
          <span>Знания</span>
        </button>
      </div>

      {/* ВКЛАДКА 1: БИТВА ВУЗОВ */}
      {activeTab === 'unis' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 font-mono">
            <span>Кластер Университета</span>
            <span>Мощность (FLOP)</span>
          </div>

          {uniLeaderboard.map((item) => {
            const isUserUni = item.university === user.university;

            return (
              <div
                key={item.rank}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  item.is_leader
                    ? 'bg-gradient-to-r from-amber-950/40 to-slate-900 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : isUserUni
                    ? 'bg-cyan-950/30 border-cyan-500/50'
                    : 'bg-cyber-card border-cyber-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${
                      item.rank === 1
                        ? 'bg-amber-500 text-black'
                        : item.rank === 2
                        ? 'bg-slate-300 text-black'
                        : item.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-gray-400'
                    }`}
                  >
                    {item.rank === 1 ? '👑' : item.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{item.university}</span>
                      {item.is_leader && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                          Суперкомпьютер недели
                        </span>
                      )}
                      {isUserUni && (
                        <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded font-mono">
                          Ваш ВУЗ
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Студентов онлайн: {item.active_students}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-cyan-400 block">
                    {item.total_compute_flops.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-500">FLOPs</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ВКЛАДКА 2: ТОП СТУДЕНТОВ */}
      {activeTab === 'students' && (
        <div className="space-y-2">
          {studentLeaderboard.map((st) => {
            const isMe = st.student_name.includes('(Вы)');

            return (
              <div
                key={st.rank}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isMe
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                    : 'bg-cyber-card border-cyber-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${
                      st.rank === 1
                        ? 'bg-amber-500 text-black'
                        : st.rank === 2
                        ? 'bg-slate-300 text-black'
                        : st.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-gray-400'
                    }`}
                  >
                    {st.rank === 1 ? '🥇' : st.rank === 2 ? '🥈' : st.rank === 3 ? '🥉' : st.rank}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{st.student_name}</span>
                      <span className="text-[10px] text-purple-400 font-mono">({st.pet_name})</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono truncate block">
                      {st.university}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-emerald-400 block">{st.accuracy}%</span>
                  <span className="text-[10px] text-gray-400">Ур. {st.pet_level}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ВКЛАДКА 3: БАЗА ЗНАНИЙ AI */}
      {activeTab === 'skills' && (
        <div className="space-y-2.5">
          {topics.map((t, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                t.done
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-gray-200'
                  : 'bg-slate-900/40 border-slate-800 text-gray-500'
              }`}
            >
              <div className="mt-0.5">
                <CheckCircle size={15} className={t.done ? 'text-emerald-400' : 'text-gray-600'} />
              </div>
              <div>
                <p className={`font-bold ${t.done ? 'text-white' : 'text-gray-500'}`}>{t.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО СМЕНЫ ВУЗА */}
      {isEditUniOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cyber-card border border-cyber-border rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsEditUniOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Trophy size={16} className="text-cyan-400" />
              <span>ВЫБОР ВУЗА И ФАКУЛЬТЕТА</span>
            </h3>

            {/* Выбор Университета */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-300 font-bold block">Университет:</label>
              <select
                value={selectedUni}
                onChange={(e) => {
                  setSelectedUni(e.target.value);
                  const found = universities.find((u) => u.name === e.target.value);
                  if (found && found.faculties.length > 0) {
                    setSelectedFaculty(found.faculties[0]);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {universities.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Выбор Факультета */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-300 font-bold block">Факультет / Кафедра:</label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {currentUniObj?.faculties.map((f, idx) => (
                  <option key={idx} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSaveUniversity}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-md"
            >
              Сохранить выбор
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
