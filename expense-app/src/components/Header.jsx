import React from 'react';
import { FaWallet } from 'react-icons/fa';

const Header = ({ currentMonth, onPreviousMonth, onNextMonth }) => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <header className="header">
      <div className="main-title">
        <FaWallet className="title-icon" />
        <h2>Control y Proyección de Gastos Personales</h2>
      </div>
      <div className="month-navigation">
        <button onClick={onPreviousMonth} className="month-nav-btn">◀</button>
        <h1>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h1>
        <button onClick={onNextMonth} className="month-nav-btn">▶</button>
      </div>
    </header>
  );
};

export default Header;