import { useEffect, useState } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight, Flame, Calendar, Percent } from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatsCard from '@/components/StatsCard';

export default function Checkin() {
  const { checkinRecords, checkinStats, fetchCheckinRecords, fetchCheckinStats, checkin, loading, dashboard } = useStore();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchCheckinRecords(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchCheckinRecords]);

  useEffect(() => {
    fetchCheckinStats();
  }, [fetchCheckinStats]);

  const todayCheckedIn = dashboard?.today_checked_in ?? false;

  const handleCheckin = async () => {
    await checkin(note);
    setNote('');
  };

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const checkedDates = new Set(
    checkinRecords.map((r) => {
      const parts = r.checkin_date.split('-');
      return parseInt(parts[2], 10);
    })
  );

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth;

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">打卡记录</h2>

      <div className="card p-6 mb-6">
        <div className="flex flex-col items-center py-6">
          {todayCheckedIn ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-fadeIn">
                <CalendarCheck className="w-12 h-12 text-green-500" />
              </div>
              <span className="text-green-600 font-semibold text-lg">今日已打卡</span>
            </div>
          ) : (
            <button
              onClick={handleCheckin}
              disabled={loading.checkin}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center hover:from-primary-700 hover:to-primary-900 transition-all duration-300 hover:scale-110 disabled:opacity-50 shadow-xl shadow-primary-700/30"
            >
              <CalendarCheck className="w-12 h-12" />
            </button>
          )}
          <p className="text-gray-500 mt-4 text-sm">
            {todayCheckedIn ? '太棒了！明天继续加油！' : '点击按钮完成今日打卡'}
          </p>
          {!todayCheckedIn && (
            <div className="mt-4 w-full max-w-sm">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="打卡备注（可选）"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm text-center"
              />
            </div>
          )}
        </div>
      </div>

      {checkinStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <StatsCard
            icon={<Calendar className="w-6 h-6" />}
            value={checkinStats.total_days}
            label="累计打卡天数"
            gradient="bg-gradient-to-br from-primary-500 to-primary-700"
          />
          <StatsCard
            icon={<Flame className="w-6 h-6" />}
            value={checkinStats.streak_days}
            label="连续打卡天数"
            gradient="bg-gradient-to-br from-orange-400 to-red-500"
          />
          <StatsCard
            icon={<Percent className="w-6 h-6" />}
            value={`${checkinStats.month_rate}%`}
            label="本月打卡率"
            gradient="bg-gradient-to-br from-accent-400 to-accent-600"
          />
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-800">
            {currentYear}年{currentMonth}月
          </h3>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
          {calendarCells.map((day, idx) => (
            <div
              key={idx}
              className="aspect-square flex flex-col items-center justify-center relative"
            >
              {day !== null && (
                <>
                  <span
                    className={`text-sm ${
                      isCurrentMonth && day === today.getDate()
                        ? 'font-bold text-primary-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {day}
                  </span>
                  {checkedDates.has(day) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 absolute bottom-1" />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
