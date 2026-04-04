import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../app/store';
import { 
  fetchBusinessDailySummary,
  fetchBusinessMonthlySummary,
  fetchBusinessYearlySummary,
  fetchBusinessEarnings,
  fetchBusinessExpenses,
  fetchBarbers,
  fetchBarberDailySummary,
  fetchBarberMonthlySummary,
  fetchBarberYearlySummary,
  fetchBarberEarnings,
  fetchBarberExpenses
} from '../store/financialSlice';
import { PiTrendUpBold, PiTrendDownBold, PiWalletBold, PiCreditCardBold, PiMoneyBold } from 'react-icons/pi';
import BarberLayout from '../../../components/layout/BarberLayout';
import WalkInModal from '../components/WalkInModal';
import ExpenseModal from '../components/ExpenseModal';
import EarningsList from '../components/EarningsList';
import ExpensesList from '../components/ExpensesList';
import DatePicker from '../../../shared/components/DatePicker';
import EndDayModal from '../components/EndDayModal';
import { formatTryInteger } from '../../../shared/utils/formatters';

function normalizeExpenseCategory(category: string | undefined | null): string {
  const t = category?.trim();
  return t ? t : 'Kategorisiz';
}

export default function FinancialDashboard() {
  const dispatch = useDispatch<AppDispatch>();

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
  });
  const [financeViewMode, setFinanceViewMode] = useState<'personal' | 'business'>('personal');
  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showEndDayModal, setShowEndDayModal] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [businessMonthlyExpenseCategoryFilter, setBusinessMonthlyExpenseCategoryFilter] = useState('');

  const { 
    dailySummary,
    monthlySummary, 
    yearlySummary,
    earnings, 
    expenses,
    barbers,
    loading 
  } = useSelector((state: RootState) => state.financial);

  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch barbers on mount
  useEffect(() => {
    dispatch(fetchBarbers());
  }, [dispatch]);

  // Set logged-in user's barber as selected when barbers are loaded
  useEffect(() => {
    if (barbers.length > 0 && !selectedBarberId && financeViewMode === 'personal' && user) {
      // Find the barber that matches the logged-in user
      const currentUserBarber = barbers.find(b => b.users.id === user.id);
      if (currentUserBarber) {
        setSelectedBarberId(currentUserBarber.id);
      } else {
        // Fallback to first barber if user's barber not found
        setSelectedBarberId(barbers[0].id);
      }
    }
  }, [barbers, selectedBarberId, financeViewMode, user]);

  const handleRefresh = useCallback(() => {
    if (viewMode === 'daily') {
      if (financeViewMode === 'personal' && selectedBarberId) {
        dispatch(fetchBarberDailySummary({ barberId: selectedBarberId, date: selectedDate }));
        dispatch(fetchBarberEarnings({ barberId: selectedBarberId, date: selectedDate }));
        dispatch(fetchBarberExpenses({ barberId: selectedBarberId, date: selectedDate }));
      } else if (financeViewMode === 'business') {
        dispatch(fetchBusinessDailySummary(selectedDate));
        dispatch(fetchBusinessEarnings(selectedDate));
        dispatch(fetchBusinessExpenses(selectedDate));
      }
    } else if (viewMode === 'monthly') {
      if (financeViewMode === 'personal' && selectedBarberId) {
        dispatch(fetchBarberMonthlySummary({ barberId: selectedBarberId, year: selectedYear, month: selectedMonth }));
      } else {
        dispatch(fetchBusinessMonthlySummary({ year: selectedYear, month: selectedMonth }));
      }
    } else {
      if (financeViewMode === 'personal' && selectedBarberId) {
        dispatch(fetchBarberYearlySummary({ barberId: selectedBarberId, year: selectedYear }));
      } else {
        dispatch(fetchBusinessYearlySummary({ year: selectedYear }));
      }
    }
  }, [dispatch, viewMode, financeViewMode, selectedDate, selectedYear, selectedMonth, selectedBarberId]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  useEffect(() => {
    setBusinessMonthlyExpenseCategoryFilter('');
  }, [selectedMonth, selectedYear]);

  const businessMonthlyExpenseItems = useMemo(() => {
    const items = monthlySummary?.items || [];
    return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlySummary?.items]);

  const businessMonthlyExpenseAggregates = useMemo(() => {
    const totals = new Map<string, number>();
    let grandTotal = 0;
    for (const e of businessMonthlyExpenseItems) {
      grandTotal += Number(e.amount);
      const key = normalizeExpenseCategory(e.category);
      totals.set(key, (totals.get(key) || 0) + Number(e.amount));
    }
    const sortedCategories = Array.from(totals.keys()).sort((a, b) => a.localeCompare(b, 'tr'));
    return { totals, sortedCategories, grandTotal };
  }, [businessMonthlyExpenseItems]);

  const businessMonthlyFilteredExpenses = useMemo(() => {
    if (!businessMonthlyExpenseCategoryFilter) return businessMonthlyExpenseItems;
    return businessMonthlyExpenseItems.filter(
      (e) => normalizeExpenseCategory(e.category) === businessMonthlyExpenseCategoryFilter
    );
  }, [businessMonthlyExpenseItems, businessMonthlyExpenseCategoryFilter]);

  const businessMonthlyHeaderTotal = useMemo(() => {
    if (!businessMonthlyExpenseCategoryFilter) {
      return businessMonthlyExpenseAggregates.grandTotal;
    }
    return businessMonthlyExpenseAggregates.totals.get(businessMonthlyExpenseCategoryFilter) || 0;
  }, [businessMonthlyExpenseAggregates, businessMonthlyExpenseCategoryFilter]);

  // Handle Enter key press to open modals
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if Enter is pressed and no modal is currently open
      if (e.key === 'Enter' && !showWalkInModal && !showExpenseModal && !showEndDayModal) {
        // Prevent if user is typing in an input/textarea/select
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          return;
        }

        if (financeViewMode === 'personal') {
          setShowWalkInModal(true);
        } else {
          setShowExpenseModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [financeViewMode, showWalkInModal, showExpenseModal, showEndDayModal]);

  // Calculate totals based on view mode
  const getTotals = () => {
    if (viewMode === 'daily' && dailySummary) {
      const earningsTotal = financeViewMode === 'personal' ? dailySummary.earnings.total : dailySummary.earnings.total;
      const expensesTotal = financeViewMode === 'personal' ? dailySummary.expenses.total : dailySummary.expenses.total;
      
      return {
        earnings: earningsTotal,
        expenses: expensesTotal,
        profit: dailySummary.netProfit, // Use netProfit for daily
        cash: dailySummary.earnings.cash || 0,
        creditCard: dailySummary.earnings.creditCard || 0
      };
    } else if (viewMode === 'monthly' && monthlySummary) {
      return {
        earnings: monthlySummary.earnings,
        expenses: monthlySummary.expenses,
        profit: monthlySummary.profit,
        cash: monthlySummary.cash || 0,
        creditCard: monthlySummary.creditCard || 0
      };
    } else if (viewMode === 'yearly' && yearlySummary) {
      return {
        earnings: yearlySummary.earnings,
        expenses: yearlySummary.expenses,
        profit: yearlySummary.profit,
        cash: yearlySummary.cash || 0,
        creditCard: yearlySummary.creditCard || 0
      };
    }
    return { earnings: 0, expenses: 0, profit: 0, cash: 0, creditCard: 0 };
  };

  const totals = getTotals();

  return (
    <BarberLayout>
      <div className="min-h-screen p-6 bg-dark">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Finans</h1>
                <p className="text-gray-400">Gelir, gider ve kar takibi</p>
              </div>
            </div>

            {/* Controls Row - Mobile: Date top, others below side-by-side. Desktop: All single row */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              
              {/* 1. Date/Month/Year Selectors */}
              <div className="flex w-full md:w-auto justify-start">
                <div className="flex flex-wrap gap-2 items-center justify-start">
                  {viewMode === 'daily' && (
                    <DatePicker
                      value={selectedDate}
                      onChange={setSelectedDate}
                    />
                  )}
                  {viewMode === 'monthly' && (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-secondary outline-none text-sm"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('tr-TR', { month: 'long' })}</option>
                        ))}
                      </select>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-secondary outline-none text-sm"
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {viewMode === 'yearly' && (
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-secondary outline-none text-sm"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* 2. & 3. Tabs Group - Side by side on mobile and desktop */}
              <div className="flex w-full md:w-auto gap-4">
                {/* 2. Finance View Mode Tabs (Bireysel/İşletme) */}
                <div className="bg-gray-800 p-1 rounded-lg flex">
                  <button
                    onClick={() => setFinanceViewMode('personal')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      financeViewMode === 'personal'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Bireysel
                  </button>
                  <button
                    onClick={() => setFinanceViewMode('business')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      financeViewMode === 'business'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    İşletme
                  </button>
                </div>

                {/* 3. View Mode Tabs (Günlük/Aylık/Yıllık) */}
                <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                  <button
                    onClick={() => setViewMode('daily')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'daily' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Günlük
                  </button>
                  <button
                    onClick={() => setViewMode('monthly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'monthly' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Aylık
                  </button>
                  <button
                    onClick={() => setViewMode('yearly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'yearly' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Yıllık
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-4 mb-8">

            {/* Barber Selection Buttons - Only show in personal view */}
            {financeViewMode === 'personal' && barbers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {barbers.map((barber) => (
                  <button
                    key={barber.id}
                    onClick={() => setSelectedBarberId(barber.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedBarberId === barber.id
                        ? 'bg-secondary text-white shadow-lg'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    {barber.users.full_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary Cards */}
          {financeViewMode === 'personal' ? (
            // Personal view: Only Income card
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8 max-w-md">
              <div className="bg-linear-to-br from-green-900/50 to-green-800/30 border border-green-700/50 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-green-200 font-medium">Gelir</h3>
                  <PiTrendUpBold className="text-3xl text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {loading ? '...' : `₺${formatTryInteger(totals.earnings)}`}
                </p>
              </div>
            </div>
          ) : (
            // Business view: New Layout
            <div className="space-y-6 mb-8">
              {/* Income Row - Hierarchical Layout */}
              <div className="bg-linear-to-br from-green-900/50 to-green-800/30 border border-green-700/50 rounded-xl p-6 shadow-xl">
                <div className="flex flex-col gap-8">
                  
                  {/* Top: Total Earnings */}
                  <div className="flex flex-col items-center justify-center relative">
                     {/* Arms - Visual Connectors (Desktop only) */}
                     <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-8 bg-green-700/50 hidden md:block"></div>
                     <div className="absolute top-full left-[25%] right-[25%] h-px bg-green-700/50 translate-y-8 hidden md:block"></div>
                     <div className="absolute top-full left-[25%] w-px h-4 bg-green-700/50 translate-y-8 hidden md:block"></div>
                     <div className="absolute top-full right-[25%] w-px h-4 bg-green-700/50 translate-y-8 hidden md:block"></div>

                     <p className="text-green-200 text-sm font-medium mb-2 uppercase tracking-wide opacity-80">Toplam Gelir</p>
                     <div className="flex items-center gap-3 bg-green-900/40 px-6 py-3 rounded-2xl border border-green-700/30 shadow-inner">
                        <PiTrendUpBold className="text-3xl text-green-400" />
                        <p className="text-4xl font-bold text-white tracking-tight">
                          {loading ? '...' : `₺${formatTryInteger(totals.earnings)}`}
                        </p>
                     </div>
                  </div>

                  {/* Bottom: Split Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-4 relative z-10">
                     {/* Cash */}
                     <div className="bg-green-900/40 rounded-xl p-4 border border-green-700/30 flex flex-col items-center hover:bg-green-900/60 transition-all group">
                        <div className="p-2 bg-green-500/10 rounded-lg mb-2 text-green-400 group-hover:text-green-300 transition-colors">
                          <PiMoneyBold size={24} />
                        </div>
                        <p className="text-green-200/70 text-xs font-medium uppercase mb-1">Nakit</p>
                        <p className="text-2xl font-bold text-white">
                          {loading ? '...' : `₺${formatTryInteger(totals.cash)}`}
                        </p>
                     </div>

                     {/* POS */}
                     <div className="bg-green-900/40 rounded-xl p-4 border border-green-700/30 flex flex-col items-center hover:bg-green-900/60 transition-all group">
                        <div className="p-2 bg-green-500/10 rounded-lg mb-2 text-green-400 group-hover:text-green-300 transition-colors">
                          <PiCreditCardBold size={24} />
                        </div>
                        <p className="text-green-200/70 text-xs font-medium uppercase mb-1">POS</p>
                        <p className="text-2xl font-bold text-white">
                          {loading ? '...' : `₺${formatTryInteger(totals.creditCard)}`}
                        </p>
                     </div>
                  </div>

                  {/* Action Button (Only in daily view) */}
                  {viewMode === 'daily' && (
                    <div className="flex justify-center border-t border-green-700/30 pt-6">
                      <button
                        onClick={() => setShowEndDayModal(true)}
                        className="px-8 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium shadow-lg hover:shadow-green-500/20 transition-all flex items-center gap-2 active:scale-95"
                      >
                        <PiCreditCardBold className="text-lg" />
                        Gün Sonu Al
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expenses & Profit Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-linear-to-br from-red-900/50 to-red-800/30 border border-red-700/50 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-red-200 font-medium">Gider</h3>
                    <PiTrendDownBold className="text-3xl text-red-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {loading ? '...' : `₺${formatTryInteger(totals.expenses)}`}
                  </p>
                </div>

                <div className="bg-linear-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/50 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-blue-200 font-medium">Kar</h3>
                    <PiWalletBold className="text-3xl text-blue-400" />
                  </div>
                  <p className={`text-3xl font-bold ${totals.profit >= 0 ? 'text-white' : 'text-red-400'}`}>
                    {loading ? '...' : `₺${formatTryInteger(totals.profit)}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* New Period Selector, Date/Month/Year Pickers, and Add Buttons */}


          {/* Conditional rendering for daily vs monthly/yearly view */}
          {viewMode === 'daily' ? (
            financeViewMode === 'personal' ? (
              // Personal view: Only earnings, full width
              <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Gelirler</h2>
                  <button
                    onClick={() => setShowWalkInModal(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <span>+ Gelir</span>
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  <EarningsList earnings={earnings} onUpdate={handleRefresh} />
                </div>
              </div>
            ) : (
              // Business view: Earnings without add button, Expenses with add button
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Gelirler</h2>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto pr-2">
                    <EarningsList earnings={earnings} onUpdate={handleRefresh} showBarber={true} />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Giderler</h2>
                    <button
                      onClick={() => setShowExpenseModal(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                    >
                      <span>+ Gider</span>
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto pr-2">
                    <ExpensesList expenses={expenses} onUpdate={handleRefresh} />
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {viewMode === 'monthly' ? 'Günlük Gelir Dağılımı' : 'Aylık Gelir Dağılımı'}
              </h3>
              <div className="h-80 relative mt-10">
                {/* Y-axis grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[100, 75, 50, 25, 0].map((percent) => (
                    <div key={percent} className="flex items-center w-full">
                      <div className="w-full border-t border-gray-700/50 border-dashed"></div>
                    </div>
                  ))}
                </div>

                {/* Chart Bars */}
                <div className="absolute inset-0 flex items-end justify-between gap-1 pl-2 pb-6">
                  {(viewMode === 'monthly' ? monthlySummary?.byDay : yearlySummary?.byMonth)?.length ? (
                    (viewMode === 'monthly' ? monthlySummary?.byDay : yearlySummary?.byMonth)?.map((item: { earnings: number; profit: number; date?: string; month?: number }, index: number) => {
                      const dataArray = viewMode === 'monthly' ? monthlySummary?.byDay : yearlySummary?.byMonth;
                      // Use earnings for business view, profit for personal view
                      const value = financeViewMode === 'business' ? item.earnings : item.profit;
                      const maxAmount = Math.max(
                        ...(dataArray?.map((i: { earnings: number; profit: number }) => 
                          financeViewMode === 'business' ? i.earnings : i.profit
                        ) || [0])
                      );
                      // Ensure min height for visibility if value > 0, but 0 if 0
                      const height = maxAmount > 0 ? (Math.max(0, value) / maxAmount) * 100 : 0;
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                          <div className="w-full bg-gray-700/30 rounded-t-sm relative flex items-end h-full group-hover:bg-gray-700/50 transition-colors">
                            <div 
                              className={`w-full rounded-t-sm transition-all duration-500 relative ${
                                financeViewMode === 'business'
                                  ? 'bg-linear-to-t from-green-600 to-green-400'
                                  : 'bg-linear-to-t from-green-600 to-green-400'
                              }`}
                              style={{ height: `${height}%` }}
                            >
                              {/* Tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-opacity z-20 border border-gray-700 shadow-xl pointer-events-none">
                                ₺{formatTryInteger(value)}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45"></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* X-axis Label */}
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 rotate-0 whitespace-nowrap">
                            {viewMode === 'monthly' 
                              ? (index % 2 === 0 ? new Date(item.date || '').getDate() : '') // Show every other day for cleaner look
                              : new Date(0, (item.month || 1) - 1).toLocaleString('tr-TR', { month: 'short' })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Veri bulunamadı
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Aylık işletme: ayın gider satırları + kategori filtresi */}
          {financeViewMode === 'business' && viewMode === 'monthly' && (
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6 mt-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-3 gap-y-2">
                  <h3 className="text-lg font-bold text-white">Giderler</h3>
                  <div className="inline-flex items-center gap-2 rounded-lg border-2 border-red-500/80 bg-red-950/50 px-3 py-2 shadow-sm shadow-red-950/40">
                    <span className="text-xs font-medium text-red-200/90">Toplam</span>
                    <span className="text-base font-bold tabular-nums text-red-100">
                      ₺{formatTryInteger(businessMonthlyHeaderTotal)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 flex-1 lg:max-w-md lg:justify-end">
                  <label htmlFor="business-monthly-expense-category" className="text-sm text-gray-400 whitespace-nowrap">
                    Kategori
                  </label>
                  <select
                    id="business-monthly-expense-category"
                    value={businessMonthlyExpenseCategoryFilter}
                    onChange={(e) => setBusinessMonthlyExpenseCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto sm:min-w-52 px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-secondary outline-none text-sm"
                  >
                    <option value="">Tümü</option>
                    {businessMonthlyExpenseAggregates.sortedCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="max-h-[480px] overflow-y-auto pr-2">
                <ExpensesList expenses={businessMonthlyFilteredExpenses} onUpdate={handleRefresh} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <WalkInModal
        isOpen={showWalkInModal}
        onClose={() => setShowWalkInModal(false)}
        onSuccess={handleRefresh}
        initialDate={selectedDate}
        barberId={financeViewMode === 'personal' ? selectedBarberId : undefined}
      />
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSuccess={handleRefresh}
        initialDate={selectedDate}
        barberId={financeViewMode === 'personal' ? selectedBarberId : undefined}
      />
      <EndDayModal
        isOpen={showEndDayModal}
        onClose={() => setShowEndDayModal(false)}
        date={selectedDate}
        totalEarnings={totals.earnings}
        currentPosAmount={totals.creditCard}
      />
    </BarberLayout>
  );
}
