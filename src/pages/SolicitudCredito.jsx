import React, { useState } from 'react';
import { useLocation } from 'react-router-dom'; // Importar useLocation para recibir el estado

function SolicitudCredito() {
  const location = useLocation();
  const { modelo, plan, entregaInicial, cantidadCuotas, montoCuota } = location.state || {}; // Recibimos los datos enviados desde MotosDetalle

  const [cedula, setCedula] = useState('');
  const [telefonoMovil, setTelefonoMovil] = useState('');
  const [telefonoLaboral, setTelefonoLaboral] = useState('');
  const [antiguedad, setAntiguedad] = useState('');
  const [aportaIps, setAportaIps] = useState(false); // Checkbox para si aporta IPS
  const [cantidadAportes, setCantidadAportes] = useState(''); // Cantidad de aportes IPS
  const [formEnviado, setFormEnviado] = useState(false);
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [barrio, setBarrio] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [documentos, setDocumentos] = useState([]);

  // Validación para cédula y teléfono
  const handleCedulaChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length <= 10) {
      setCedula(value);
    }
  };

  const handleTelefonoChange = (e, setPhone) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length <= 15) {
      setPhone(value);
    }
  };

  const handleAportaIpsChange = (e) => {
    setAportaIps(e.target.checked);
    if (!e.target.checked) {
      setCantidadAportes(''); // Si no está marcado, limpiar el campo
    }
  };

  const handleCantidadAportesChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCantidadAportes(value);
  };

  // Manejo de documentos
  const handleDocumentosChange = (e) => {
    setDocumentos(Array.from(e.target.files)); // Convierte los archivos en un array
  };

  // Envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormEnviado(true);
    console.log('Formulario enviado:', { cedula, telefonoMovil, telefonoLaboral, antiguedad, aportaIps, cantidadAportes, documentos });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Solicitud de Crédito</h1>

      <form onSubmit={handleSubmit}>
       {/* Modelo Solicitado */}
       <div className="mb-0">
          <label className="block font-bold mb-1 inline">Modelo Solicitado: </label>
          <p className="text-gray-700 inline">{modelo}</p> {/* Mostrar en una sola línea */}
        </div>

        {/* Plan de Cuotas */}
        <div className="mb-4">
          {/* Detalles del plan sin espacio adicional */}
          <p className="text-gray-700">
            <strong>Entrega Inicial:</strong> G {entregaInicial ? Number(entregaInicial).toLocaleString('es-ES') : '0'}
          </p>
          <p className="text-gray-700">
            <strong>Cantidad de Cuotas:</strong> {cantidadCuotas ? cantidadCuotas : '0'}
          </p>
          <p className="text-gray-700">
            <strong>Monto por Cuota:</strong> G {montoCuota ? montoCuota.toLocaleString('es-ES') : '0'}
          </p>
        </div>

        {/* Datos Personales */}
        <h2 className="text-xl font-bold mb-2">Datos Personales</h2>

        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label className="block font-semibold mb-1">Cédula</label>
            <input
              type="text"
              value={cedula}
              onChange={handleCedulaChange}
              className="border border-gray-300 px-2 py-1 w-full rounded"
              placeholder="Número de Cédula"
              required
            />
          </div>

          <div className="w-1/2">
            <label className="block font-semibold mb-1">Teléfono Móvil</label>
            <input
              type="text"
              value={telefonoMovil}
              onChange={(e) => handleTelefonoChange(e, setTelefonoMovil)}
              className="border border-gray-300 px-2 py-1 w-full rounded"
              placeholder="Teléfono Móvil"
              required
            />
          </div>
        </div>

        {/* Fecha de Nacimiento */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Fecha de Nacimiento</label>
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            className="border border-gray-300 px-2 py-1 w-full rounded"
            required
          />
        </div>

        {/* Barrio y Ciudad */}
        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label className="block font-semibold mb-1">Barrio</label>
            <input
              type="text"
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              className="border border-gray-300 px-2 py-1 w-full rounded"
              placeholder="Barrio"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block font-semibold mb-1">Ciudad</label>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className="border border-gray-300 px-2 py-1 w-full rounded"
              placeholder="Ciudad"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Dirección Particular</label>
          <input
            type="text"
            className="border border-gray-300 px-2 py-1 w-full rounded"
            placeholder="Dirección Particular"
            required
          />
        </div>

        {/* Documentos */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Subir Documentos (Cédula, Ingresos, Boletas)</label>
          <input
            type="file"
            multiple
            onChange={handleDocumentosChange}
            className="border border-gray-300 px-2 py-1 w-full rounded"
          />
        </div>

        {/* Datos Laborales */}
        <h2 className="text-xl font-bold mb-2">Datos Laborales</h2>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Empresa</label>
          <input
            type="text"
            className="border border-gray-300 px-2 py-1 w-full rounded"
            placeholder="Empresa"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Dirección Laboral</label>
          <input
            type="text"
            className="border border-gray-300 px-2 py-1 w-full rounded"
            placeholder="Dirección Laboral"
            required
          />
        </div>

        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label className="block font-semibold mb-1">Teléfono Laboral</label>
            <input
              type="text"
              value={telefonoLaboral}
              onChange={(e) => handleTelefonoChange(e, setTelefonoLaboral)}
              className="border border-gray-300 px-2 py-1 w-full rounded"
              placeholder="Teléfono Laboral"
              required
            />
          </div>

          <div className="w-1/2">
            <label className="block font-semibold mb-1">Antigüedad</label>
            <input
              type="number"
              value={antiguedad}
              onChange={(e) => setAntiguedad(e.target.value)}
              className="border border-gray-300 px-2 py-1 w-full rounded"
              placeholder="Antigüedad (años)"
              required
            />
          </div>
        </div>

        {/* Checkbox Aporta IPS */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={aportaIps}
            onChange={handleAportaIpsChange}
            className="mr-2"
          />
          <label className="block font-semibold">Marcar si aporta IPS</label>
        </div>

        {/* Cantidad de Aportes habilitado o deshabilitado */}
        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label className="block font-semibold mb-1">Cantidad de Aportes</label>
            <input
              type="text"
              value={cantidadAportes}
              onChange={handleCantidadAportesChange}
              className="border border-gray-300 px-2 py-1 w-full rounded"
              placeholder="Cantidad de Aportes"
              disabled={!aportaIps} // Deshabilitar si no se marca
            />
          </div>

          {/* Salario */}
          <div className="w-1/2">
            <label className="block font-semibold mb-1">Salario</label>
            <input
              type="number"
              className="border border-gray-300 px-2 py-1 w-full rounded"
              placeholder="Salario"
              required
            />
          </div>
        </div>

        {/* Referencias Comerciales */}
        <h2 className="text-xl font-bold mb-2">Referencias Comerciales</h2>

        {[1, 2].map((index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Referencia Comercial {index}</h3>
            <div className="flex space-x-4 mb-2">
              <div className="w-1/2">
                <label className="block font-semibold">Nombre Local</label>
                <input
                  type="text"
                  className="border border-gray-300 px-2 py-1 w-full rounded"
                  placeholder={`Nombre Local ${index}`}
                />
              </div>
              <div className="w-1/2">
                <label className="block font-semibold">Teléfono</label>
                <input
                  type="text"
                  className="border border-gray-300 px-2 py-1 w-full rounded"
                  placeholder="Teléfono"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Botón de envío */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
        >
          Enviar Datos
        </button>

        {formEnviado && <p className="text-green-500 mt-4">Formulario enviado exitosamente.</p>}
      </form>
    </div>
  );
}

export default SolicitudCredito;
