import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import HeaderPage from './components/HeaderPage';
import RoutesHandler from './components/RoutesHandler';

function App() {
  const location = useLocation();

  // Muestra el Header principal solo en la página Home ("/")
  const isHome = location.pathname === "/";

  return (
    <div>
      {/* Renderiza el Header correspondiente */}
      {isHome ? <Header /> : <HeaderPage category={location.pathname} />}
      
      {/* Renderiza las rutas */}
      <RoutesHandler />
    </div>
  );
}

export default App;
