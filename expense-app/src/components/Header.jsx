import React from 'react';

const Header = ({ currentMonth, onPreviousMonth, onNextMonth }) => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <header className="header">
      <button onClick={onPreviousMonth} className="month-nav-btn">◀</button>
      <h1>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h1>
      <button onClick={onNextMonth} className="month-nav-btn">▶</button>
    </header>
  );
};

export default Header;