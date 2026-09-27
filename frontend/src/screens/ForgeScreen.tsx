import React, { useState, useEffect } from 'react';
import { User, ForgeState, LayerItem, UserInventoryItem } from '../types/game';
import { api } from '../services/api';
import { hapticImpact, hapticNotification } from '../services/telegram';
import { Cpu, ShoppingBag, Check, Zap, Sparkles, ArrowRight, ShieldCheck, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ForgeScreenProps {
  user: User;
  onUpdateTokens: (newBalance: number) => void;
}

export const ForgeScreen: React.FC<ForgeScreenProps> = ({ user, onUpdateTokens }) => {
  const [forgeState, setForgeState] = useState<ForgeState | null>(null);
  const [shopLayers, setShopLayers] = useState<LayerItem[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shop'>('inventory');
  const [selectedSlotForEquip, setSelectedSlotForEquip] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [state, shop] = await Promise.all([
        api.getForgeState(user.telegram_id),
        api.getForgeShop(),
      ]);
      setForgeState(state);
      setShopLayers(shop);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (layer: LayerItem) => {
    if (user.compute_tokens < layer.cost_tokens || actionLoading) return;

    try {
      setActionLoading(true);
      hapticImpact('heavy');
      const res = await api.buyLayer(user.telegram_id, layer.id);
      hapticNotification('success');
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });

      onUpdateTokens(res.new_balance);
      await loadData();
    } catch (err: any) {
      hapticNotification('error');
      alert(err.message || 'Ошибка покупки');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEquip = async (invItem: UserInventoryItem, slotName: string) => {
    if (actionLoading) return;

    try {
      setActionLoading(true);
      hapticImpact('medium');
      await api.equipLayer(user.telegram_id, invItem.id, slotName);
      hapticNotification('success');
      setSelectedSlotForEquip(null);
      await loadData();
    } catch (err: any) {
      hapticNotification('error');
      alert(err.message || 'Ошибка экипировки');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnequip = async (invItem: UserInventoryItem) => {
    if (actionLoading) return;

    try {
      setActionLoading(true);
      hapticImpact('light');
      await api.unequipLayer(user.telegram_id, invItem.id);
      await loadData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !forgeState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-purple-300 text-xs font-mono">Сборка графа нейросети...</p>
      </div>
    );
  }

  const slots = [
    { key: 'slot_input', label: 'Входной Сенсор', layer: forgeState.equipped_slots.slot_input, acceptType: 'slot_input' },
    { key: 'slot_hidden_1', label: 'Скрытый Блок 1', layer: forgeState.equipped_slots.slot_hidden_1, acceptType: 'slot_hidden' },
    { key: 'slot_hidden_2', label: 'Скрытый Блок 2', layer: forgeState.equipped_slots.slot_hidden_2, acceptType: 'slot_hidden' },
    { key: 'slot_regularizer', label: 'Регуляризатор', layer: forgeState.equipped_slots.slot_regularizer, acceptType: 'slot_regularizer' },
  ];

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-amber-300 border-amber-500/50 bg-amber-950/40';
      case 'epic':
        return 'text-purple-300 border-purple-500/50 bg-purple-950/40';
      case 'rare':
        return 'text-cyan-300 border-cyan-500/50 bg-cyan-950/40';
      default:
        return 'text-gray-300 border-gray-600 bg-slate-900/60';
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24 px-4 pt-2 max-w-md mx-auto">
      {/* Шапка графа */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
            <Cpu size={18} className="text-cyan-400" />
            <span>NEURAL FORGE</span>
          </h1>
          <p className="text-xs text-gray-400">Архитектура и вычислительные слои</p>
        </div>

        {/* Суммарный бонус */}
        <div className="flex items-center gap-2 bg-cyber-card border border-cyber-border px-3 py-1.5 rounded-xl text-xs font-mono">
          <span className="text-emerald-400 font-bold">+{forgeState.total_accuracy_bonus}% Acc</span>
          <span className="text-rose-400 font-bold">-{forgeState.total_loss_reduction} Loss</span>
        </div>
      </div>

      {/* Интерактивный Граф Архитектуры (4 Слота) */}
      <div className="bg-cyber-card border border-cyber-border p-3.5 rounded-3xl space-y-2.5 shadow-xl">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Схема Графа Модели</span>
          <span className="text-cyan-400 font-mono text-[10px]">PyTorch Engine</span>
        </div>

        <div className="space-y-2">
          {slots.map((slot, index) => {
            const isEquipped = !!slot.layer;
            const isSelected = selectedSlotForEquip === slot.key;

            return (
              <React.Fragment key={slot.key}>
                <div
                  onClick={() => {
                    hapticImpact('light');
                    setSelectedSlotForEquip(isSelected ? null : slot.key);
                    setActiveTab('inventory');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                      : isEquipped
                      ? 'border-purple-500/40 bg-slate-900/80 hover:border-purple-400'
                      : 'border-dashed border-gray-700 bg-slate-900/30 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                        isEquipped ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50' : 'bg-slate-800 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400">{slot.label}</div>
                      <div className="text-xs font-bold text-white">
                        {slot.layer ? slot.layer.name : 'Пустой слот (Нажмите для выбора)'}
                      </div>
                    </div>
                  </div>

                  {slot.layer ? (
                    <div className="text-right">
                      <span className="text-emerald-400 font-mono text-xs font-bold block">
                        +{slot.layer.accuracy_bonus}%
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        -{slot.layer.loss_reduction} loss
                      </span>
                    </div>
                  ) : (
                    <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400">
                      <Plus size={16} />
                    </div>
                  )}
                </div>

                {index < slots.length - 1 && (
                  <div className="flex justify-center my-[-4px]">
                    <div className="w-0.5 h-3 bg-gradient-to-b from-purple-500 to-cyan-500/40"></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Переключатель Вкладок: Инвентарь / Pip Store */}
      <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-cyber-border">
        <button
          onClick={() => {
            hapticImpact('light');
            setActiveTab('inventory');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'inventory'
              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Cpu size={15} />
          <span>Инвентарь ({forgeState.inventory.length})</span>
        </button>

        <button
          onClick={() => {
            hapticImpact('light');
            setActiveTab('shop');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'shop'
              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingBag size={15} />
          <span>Pip Store (Магазин)</span>
        </button>
      </div>

      {/* Контент: ИНВЕНТАРЬ */}
      {activeTab === 'inventory' && (
        <div className="space-y-2.5">
          {selectedSlotForEquip && (
            <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/40 rounded-xl text-xs text-cyan-300 flex items-center justify-between">
              <span>Выберите модуль для слота: <strong>{slots.find(s => s.key === selectedSlotForEquip)?.label}</strong></span>
              <button
                onClick={() => setSelectedSlotForEquip(null)}
                className="text-[11px] underline text-gray-400 hover:text-white"
              >
                Отмена
              </button>
            </div>
          )}

          {forgeState.inventory.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              Инвентарь пуст. Загляните в Pip Store за новыми модулями!
            </div>
          ) : (
            forgeState.inventory.map((invItem) => {
              const layer = invItem.layer;
              const badgeClass = getRarityBadge(layer.rarity);

              return (
                <div
                  key={invItem.id}
                  className="bg-cyber-card border border-cyber-border p-3 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{layer.name}</span>
                      <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded border ${badgeClass}`}>
                        {layer.rarity}
                      </span>
                      {invItem.is_equipped && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                          Надет
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-1">{layer.description}</p>
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="text-emerald-400">+{layer.accuracy_bonus}% Acc</span>
                      <span className="text-rose-400">-{layer.loss_reduction} Loss</span>
                    </div>
                  </div>

                  {invItem.is_equipped ? (
                    <button
                      onClick={() => handleUnequip(invItem)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl text-xs font-semibold transition-all active:scale-95"
                    >
                      Снять
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const targetSlot = selectedSlotForEquip || (layer.slot_type === 'slot_hidden' ? 'slot_hidden_1' : layer.slot_type);
                        handleEquip(invItem, targetSlot);
                      }}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      Экипировать
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Контент: PIP STORE (МАГАЗИН) */}
      {activeTab === 'shop' && (
        <div className="space-y-2.5">
          <div className="text-[11px] text-gray-400 px-1">
            Покупайте библиотеки и архитектурные блоки за FLOP, заработанные на парах:
          </div>

          {shopLayers.map((layer) => {
            const badgeClass = getRarityBadge(layer.rarity);
            const canAfford = user.compute_tokens >= layer.cost_tokens;
            const alreadyOwned = forgeState.inventory.some((i) => i.layer.id === layer.id);

            return (
              <div
                key={layer.id}
                className="bg-cyber-card border border-cyber-border p-3.5 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{layer.name}</span>
                    <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded border ${badgeClass}`}>
                      {layer.rarity}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-snug">{layer.description}</p>
                  <div className="flex items-center gap-3 text-[11px] font-mono pt-0.5">
                    <span className="text-emerald-400 font-bold">+{layer.accuracy_bonus}% Acc</span>
                    <span className="text-rose-400 font-bold">-{layer.loss_reduction} Loss</span>
                  </div>
                </div>

                <div>
                  {alreadyOwned ? (
                    <span className="text-[11px] text-gray-500 font-mono flex items-center gap-1">
                      <Check size={14} className="text-emerald-400" /> Куплено
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuy(layer)}
                      disabled={!canAfford || actionLoading}
                      className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1 shadow-md active:scale-95 ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110'
                          : 'bg-slate-800 text-gray-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Zap size={13} className={canAfford ? 'fill-black' : 'fill-gray-500'} />
                      <span>{layer.cost_tokens}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
