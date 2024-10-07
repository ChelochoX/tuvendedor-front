import React from 'react';
import { Routes, Route } from 'react-router-dom'; // No es necesario el BrowserRouter aquí
import Home from '../pages/Home';
import Motos from '../pages/Motos';
import Vehiculos from '../pages/Vehiculos';
import Inmuebles from '../pages/Inmuebles';
import MotosDetalle from '../pages/MotosDetalle'; 
import SolicitudCredito from '../pages/SolicitudCredito';

function RoutesHandler() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/motos" element={<Motos />} />
      <Route path="/motos/detalle/:motoId" element={<MotosDetalle />} /> {/* Nueva ruta para detalles */}
      <Route path="/vehiculos" element={<Vehiculos />} />
      <Route path="/inmuebles" element={<Inmuebles />} />
      <Route path="/solicitarcredito" element={<SolicitudCredito />} />
    </Routes>
  );
}

export default RoutesHandler;
