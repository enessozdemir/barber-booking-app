import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../app/store';
import { 
  fetchDailySummary, 
  fetchEarnings,
  fetchMonthlySummary,
  fetchYearlySummary,
  fetchBusinessDailySummary,
  fetchBusinessMonthlySummary,
  fetchBusinessYearlySummary,
  fetchBusinessEarnings,
  fetchBusinessExpenses
} from '../store/financialSlice';
import { PiTrendUpBold, PiTrendDownBold, PiWalletBold } from 'react-icons/pi';
import BarberLayout from '../../../components/layout/BarberLayout';
import WalkInModal from '../components/WalkInModal';
import ExpenseModal from '../components/ExpenseModal';
import EarningsList from '../components/EarningsList';
import ExpensesList from '../components/ExpensesList';
import DatePicker from '../../../shared/components/DatePicker';

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

  const { 
    monthlySummary, 
    yearlySummary,
    earnings, 
    expenses, 
    loading 
  } = useSelector((state: RootState) => state.financial);

  const handleRefresh = useCallback(() => {
    if (viewMode === 'daily') {
      if (financeViewMode === 'personal') {
        dispatch(fetchDailySummary(selectedDate));
        dispatch(fetchEarnings(selectedDate));
        // No expenses in personal view
      } else {
        dispatch(fetchBusinessDailySummary(selectedDate));
        dispatch(fetchBusinessEarnings(selectedDate));
        dispatch(fetchBusinessExpenses(selectedDate));
      }
    } else if (viewMode === 'monthly') {
      if (financeViewMode === 'personal') {
        dispatch(fetchMonthlySummary({ year: selectedYear, month: selectedMonth }));
      } else {
        dispatch(fetchBusinessMonthlySummary({ year: selectedYear, month: selectedMonth }));
      }
    } else {
      if (financeViewMode === 'personal') {
        dispatch(fetchYearlySummary({ year: selectedYear }));
      } else {
        dispatch(fetchBusinessYearlySummary({ year: selectedYear }));
      }
    }
  }, [dispatch, viewMode, financeViewMode, selectedDate, selectedYear, selectedMonth]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Calculate totals based on view mode
  const getTotals = () => {
    if (viewMode === 'daily') {
      const earningsTotal = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
      const expensesTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        earnings: earningsTotal,
        expenses: expensesTotal,
        profit: earningsTotal - expensesTotal
      };
    } else if (viewMode === 'monthly' && monthlySummary) {
      return {
        earnings: monthlySummary.earnings,
        expenses: monthlySummary.expenses,
        profit: monthlySummary.profit
      };
    } else if (viewMode === 'yearly' && yearlySummary) {
      return {
        earnings: yearlySummary.earnings,
        expenses: yearlySummary.expenses,
        profit: yearlySummary.profit
      };
    }
    return { earnings: 0, expenses: 0, profit: 0 };
  };

  const totals = getTotals();

  return (
    <BarberLayout>
      <div className="min-h-screen p-6 bg-dark">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Finans</h1>
              <p className="text-gray-400">Gelir, gider ve kar takibi</p>
            </div>
            
            {/* Finance View Mode Tabs */}
            <div className="bg-gray-800 p-1 rounded-lg flex">
              <button
                onClick={() => setFinanceViewMode('personal')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  financeViewMode === 'personal'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Bireysel
              </button>
              <button
                onClick={() => setFinanceViewMode('business')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  financeViewMode === 'business'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                İşletme
              </button>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-4 items-center">
              {/* View Mode Selector */}
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

              {/* Date/Month/Year Selectors */}
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
                    className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('tr-TR', { month: 'long' })}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-secondary outline-none"
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
                  className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Earnings Card */}
            <div className="bg-linear-to-br from-green-900/50 to-green-800/30 border border-green-700/50 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-green-200 font-medium">Gelir</h3>
                <PiTrendUpBold className="text-3xl text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {loading ? '...' : `₺${totals.earnings.toFixed(2)}`}
              </p>
            </div>

            {/* Expenses Card - Only show in Business view */}
            {financeViewMode === 'business' && (
              <div className="bg-linear-to-br from-red-900/50 to-red-800/30 border border-red-700/50 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-red-200 font-medium">Gider</h3>
                  <PiTrendDownBold className="text-3xl text-red-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {loading ? '...' : `₺${totals.expenses.toFixed(2)}`}
                </p>
              </div>
            )}

            {/* Profit Card - Only show in Business view */}
            {financeViewMode === 'business' && (
              <div className="bg-linear-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/50 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-blue-200 font-medium">Kar</h3>
                  <PiWalletBold className="text-3xl text-blue-400" />
                </div>
                <p className={`text-3xl font-bold ${totals.profit >= 0 ? 'text-white' : 'text-red-400'}`}>
                  {loading ? '...' : `₺${totals.profit.toFixed(2)}`}
                </p>
              </div>
            )}
          </div>

          {/* New Period Selector, Date/Month/Year Pickers, and Add Buttons */}


          {/* Conditional rendering for daily vs monthly/yearly view */}
          {viewMode === 'daily' ? (
            <div className={`grid grid-cols-1 ${financeViewMode === 'business' ? 'lg:grid-cols-2' : ''} gap-8`}>
              {/* Earnings Section */}
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

              {/* Expenses Section - Only show in Business view */}
              {financeViewMode === 'business' && (
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
              )}
            </div>
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
                    (viewMode === 'monthly' ? monthlySummary?.byDay : yearlySummary?.byMonth)?.map((item: { profit: number; date?: string; month?: number }, index: number) => {
                      const dataArray = viewMode === 'monthly' ? monthlySummary?.byDay : yearlySummary?.byMonth;
                      const maxAmount = Math.max(
                        ...(dataArray?.map((i: { profit: number }) => i.profit) || [0])
                      );
                      // Ensure min height for visibility if value > 0, but 0 if 0
                      const height = maxAmount > 0 ? (Math.max(0, item.profit) / maxAmount) * 100 : 0;
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                          <div className="w-full bg-gray-700/30 rounded-t-sm relative flex items-end h-full group-hover:bg-gray-700/50 transition-colors">
                            <div 
                              className={`w-full rounded-t-sm transition-all duration-500 relative ${
                                item.profit >= 0 
                                  ? 'bg-linear-to-t from-blue-600 to-blue-400' 
                                  : 'bg-linear-to-t from-red-600 to-red-400'
                              }`}
                              style={{ height: `${height}%` }}
                            >
                              {/* Tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-opacity z-20 border border-gray-700 shadow-xl pointer-events-none">
                                ₺{item.profit.toFixed(2)}
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
        </div>
      </div>

      {/* Modals */}
      <WalkInModal
        isOpen={showWalkInModal}
        onClose={() => setShowWalkInModal(false)}
        onSuccess={handleRefresh}
        initialDate={selectedDate}
      />
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSuccess={handleRefresh}
        initialDate={selectedDate}
      />
    </BarberLayout>
  );
}
