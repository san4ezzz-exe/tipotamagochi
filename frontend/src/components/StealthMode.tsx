import React from 'react';
import { EyeOff } from 'lucide-react';
import { hapticImpact } from '../services/telegram';

interface StealthModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StealthMode: React.FC<StealthModeProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleExit = () => {
    hapticImpact('medium');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#f8f9fa] text-[#212529] font-serif p-5 overflow-y-auto select-none"
      onDoubleClick={handleExit}
    >
      {/* Кнопка выхода замаскирована под неприметный номер страницы */}
      <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-4 text-xs text-gray-500 font-mono">
        <span>Лекция_04_Дискретная_математика.pdf</span>
        <button
          onClick={handleExit}
          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 text-xs flex items-center gap-1 active:bg-gray-400"
          title="Вернуться в игру"
        >
          <EyeOff size={12} />
          <span>Стр. 14 / 86</span>
        </button>
      </div>

      <div className="max-w-lg mx-auto space-y-4 text-sm leading-relaxed">
        <h1 className="text-base font-bold text-center uppercase tracking-wide border-b border-gray-400 pb-1">
          Раздел 2. Теория графов и бинарные отношения
        </h1>

        <p className="text-justify indent-4">
          <strong>Определение 2.1.</strong> Бинарным отношением <span className="font-mono">R</span> на множестве <span className="font-mono">A</span> называется любое подмножество декартова произведения <span className="font-mono">A × A</span>. Если пара <span className="font-mono">(x, y) ∈ R</span>, то говорят, что элемент <span className="font-mono">x</span> находится в отношении <span className="font-mono">R</span> с элементом <span className="font-mono">y</span> (обозначается как <span className="font-mono">x R y</span>).
        </p>

        <div className="bg-gray-100 p-3 rounded border border-gray-300 my-2 text-xs font-mono">
          <p className="font-bold mb-1">Свойства бинарных отношений:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Рефлексивность:</strong> ∀x ∈ A : (x R x);</li>
            <li><strong>Симметричность:</strong> ∀x, y ∈ A : (x R y ⇒ y R x);</li>
            <li><strong>Антисимметричность:</strong> ∀x, y ∈ A : (x R y ∧ y R x ⇒ x = y);</li>
            <li><strong>Транзитивность:</strong> ∀x, y, z ∈ A : (x R y ∧ y R z ⇒ x R z).</li>
          </ul>
        </div>

        <p className="text-justify indent-4">
          <strong>Теорема 2.3 (О факторизации).</strong> Всякое отношение эквивалентности на множестве <span className="font-mono">A</span> определяет разбиение этого множества на непересекающиеся классы эквивалентности, и обратно — всякое разбиение множества определяет отношение эквивалентности.
        </p>

        <p className="text-xs text-gray-400 italic text-center pt-8">
          (Дважды коснитесь экрана или нажмите «Стр. 14», чтобы свернуть конспект)
        </p>
      </div>
    </div>
  );
};
