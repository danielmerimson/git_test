import React from 'react';
import './Calendar.css';

interface CalendarProps {
  calendarSelectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ calendarSelectedDate, onDateSelect }) => {
  const today = new Date();
  const currentMonth = calendarSelectedDate.getMonth();
  const currentYear = calendarSelectedDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentYear, currentMonth - 1, 1);
    onDateSelect(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);
    onDateSelect(nextMonth);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    onDateSelect(clickedDate);
  };

  const isSelectedDate = (day: number) => {
    return calendarSelectedDate.getDate() === day &&
           calendarSelectedDate.getMonth() === currentMonth &&
           calendarSelectedDate.getFullYear() === currentYear;
  };

  const isToday = (day: number) => {
    return today.getDate() === day &&
           today.getMonth() === currentMonth &&
           today.getFullYear() === currentYear;
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayClasses = [
        'calendar-day',
        isSelectedDate(day) ? 'selected' : '',
        isToday(day) ? 'today' : ''
      ].filter(Boolean).join(' ');

      days.push(
        <div
          key={day}
          className={dayClasses}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-button">‹</button>
        <h2 className="month-year">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button onClick={handleNextMonth} className="nav-button">›</button>
      </div>
      
      <div className="calendar-weekdays">
        {weekdays.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default Calendar;
