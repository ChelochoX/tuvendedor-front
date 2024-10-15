import React from 'react';
import { Routes, Route } from 'react-router-dom'; // No es necesario el BrowserRouter aquí
import Home from '../pages/Home';
import Motos from '../pages/Motos';
import Vehiculos from '../pages/Vehiculos';
import Inmuebles from '../pages/Inmuebles';
import MotosDetalle from '../pages/MotosDetalle'; 
import SolicitudCredito from '../pages/SolicitudCredito';
import PaginaTemporal from '../pages/PaginaTemporal.jsx';

function RoutesHandler() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/motos" element={<Motos />} />
      <Route path="/motos/detalle/:motoId" element={<MotosDetalle />} /> {/* Nueva ruta para detalles */}
      <Route path="/vehiculos" element={<PaginaTemporal />} /> {/* Redirigir a la página temporal */}
      <Route path="/inmuebles" element={<PaginaTemporal />} /> {/* Redirigir a la página temporal */}
      <Route path="/nosotros" element={<PaginaTemporal />} /> {/* Redirigir a la página temporal */}
      <Route path="/contacto" element={<PaginaTemporal />} /> {/* Redirigir a la página temporal */}
      <Route path="/solicitarcredito" element={<SolicitudCredito />} />
    </Routes>
  );
}

export default RoutesHandler;
