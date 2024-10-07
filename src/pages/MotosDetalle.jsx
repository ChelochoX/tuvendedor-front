import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function MotosDetalle() {
  const location = useLocation();
  const navigate = useNavigate();
  const { images, title } = location.state || {};

  const [mainImage, setMainImage] = useState(images ? images[0] : '');
  const [producto, setProducto] = useState(null);
  const [cuotaMasBaja, setCuotaMasBaja] = useState(0);
  const [precioContado, setPrecioContado] = useState(0);
  const [entregaInicial, setEntregaInicial] = useState('');
  const [cantidadCuotas, setCantidadCuotas] = useState(12);
  const [incluyeEntrega, setIncluyeEntrega] = useState(false); 
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [montoCuota, setMontoCuota] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const obtenerDatosProducto = async () => {
      try {
        const modeloFormateado = encodeURIComponent(title.replace('×', 'x').trim());
        const response = await axios.get(`https://localhost:7040/api/Motos/producto/${modeloFormateado}`);
        const data = response.data;
        setProducto(data);
        setPrecioContado(data.precioPublico);
        setSelectedPlan(data.planes[0]);
        setCuotaMasBaja(data.planes[0].importe);
      } catch (error) {
        console.error("Error al obtener los datos del producto:", error);
      }
    };
    obtenerDatosProducto();
  }, [title]);

  const handleEntregaInicialChange = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
      setEntregaInicial('');
    } else {
      setEntregaInicial(value.toString());
    }
  };

  const handleCheckboxChange = () => {
    setIncluyeEntrega(!incluyeEntrega);
    setMontoCuota(0);
  };

  const handleCuotasChange = (e) => {
    setCantidadCuotas(parseInt(e.target.value));
  };

  const calcularCuota = async () => {
    if (!entregaInicial || parseFloat(entregaInicial) <= 0) {
      setErrorMessage('La entrega inicial no puede estar vacio.');
      return;
    }
    setErrorMessage('');
    if (incluyeEntrega) {
      try {
        const response = await axios.post('https://localhost:7040/api/Motos/producto/calcularcuota', {
          modelo: title,
          entregaInicial: entregaInicial,
          cantidadCuotas: cantidadCuotas
        });

        if (typeof response.data === 'number') {
          setMontoCuota(response.data);
        } else if (response.data.montoCuota) {
          setMontoCuota(response.data.montoCuota);
        }

      } catch (error) {
        console.error("Error al calcular el monto de la cuota:", error);
      }
    }
  };

  const handlePlanChange = (e) => {
    const selectedPlanId = parseInt(e.target.value);
    const planSeleccionado = producto.planes.find(plan => plan.idPlan === selectedPlanId);
    setSelectedPlan(planSeleccionado);
    setCuotaMasBaja(planSeleccionado.importe);
  };

  const mostrarMontoCuotaCalculada = () => {
    return montoCuota > 0 ? montoCuota.toLocaleString('es-ES') : '0';
  };

  // Modificación en función de "Solicitar Crédito"
  const handleSolicitarCredito = () => {
    let datosPlan;

    // Si el checkbox está activado, pasa los valores manuales
    if (incluyeEntrega) {
      datosPlan = {
        modelo: title,
        plan: 'Plan personalizado con entrega mayor',
        entregaInicial: entregaInicial,
        cantidadCuotas: cantidadCuotas,
        montoCuota: montoCuota,
      };
    } else {
      // Si el checkbox no está activado, pasa los valores del plan seleccionado
      datosPlan = {
        modelo: title,
        plan: selectedPlan.nombrePlan,
        entregaInicial: selectedPlan.entrega,
        cantidadCuotas: selectedPlan.cuotas,
        montoCuota: cuotaMasBaja
      };
    }

    // Navegamos a la página de Solicitar Crédito pasando los datos del plan
    navigate('/solicitarcredito', { state: datosPlan });
  };

  if (!images || images.length === 0) {
    return <div>Error: No se encontraron imágenes para este modelo.</div>;
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex">
          <div className="w-1/2 flex flex-col items-center">
            {/* Contenedor de la imagen principal */}
            <div className="w-full h-auto max-h-96">
              <img
                src={`https://localhost:7040${mainImage}`}
                alt={title}
                className="w-full h-full object-contain max-h-96"
              />
            </div>
            {/* Miniaturas para seleccionar otras imágenes */}
            <div className="flex justify-center mt-4 flex-wrap space-x-2">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={`https://localhost:7040${image}`}
                  alt={`${title} vista ${index + 1}`}
                  className={`w-16 h-16 object-contain cursor-pointer border ${mainImage === image ? 'border-orange-500' : 'border-gray-300'}`}
                  onClick={() => setMainImage(image)}
                />
              ))}
            </div>
          </div>

          <div className="w-1/2 pl-8">
            <h1 className="text-3xl font-bold">{title}</h1>

            <p className="text-black font-semibold mt-2">
              Precio contado: G {precioContado.toLocaleString()}
            </p>
            <p className="text-green-600 font-semibold mt-1">
              ¡Obtén un descuento especial al pagar al contado!
            </p>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Planes de financiamiento:</h3>
              <select
                className="border border-gray-300 px-2 py-1 rounded w-full"
                onChange={handlePlanChange}
              >
                {producto?.planes.map(plan => (
                  <option key={plan.idPlan} value={plan.idPlan}>
                    {plan.nombrePlan}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex justify-between">
              {selectedPlan && selectedPlan.entrega > 0 && (
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Entrega Inicial:</label>
                  <p className="text-xl font-bold text-orange-600">
                    G {selectedPlan.entrega.toLocaleString('es-ES')}
                  </p>
                </div>
              )}

              {selectedPlan && (
                <div className="flex-1 text-center">
                  <label className="block font-semibold mb-1">Cantidad de Cuotas:</label>
                  <p className="text-xl font-bold text-orange-600">
                    {selectedPlan.cuotas}
                  </p>
                </div>
              )}

              <div className="flex-1 text-right">
                <label className="block font-semibold mb-1">Monto por Cuota:</label>
                <p className="text-xl font-bold text-orange-600">
                  G {cuotaMasBaja.toLocaleString('es-ES')}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center mb-4 space-x-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incluyeEntrega}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-orange-500 rounded focus:ring-0 cursor-pointer"
                  />
                  <span className="ml-2 text-gray-700">Calcular con entrega mayor</span>
                </label>
              </div>
              {incluyeEntrega && (
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label className="block font-semibold mb-1">Entrega Inicial:</label>
                    <input
                      type="number"
                      value={entregaInicial}
                      onChange={handleEntregaInicialChange}
                      className="border border-gray-300 px-2 py-1 w-full rounded"
                      placeholder="Monto de entrega inicial"
                      min="0"
                    />
                    {errorMessage && (
                      <p className="text-red-500 text-sm mt-1" style={{ whiteSpace: 'nowrap' }}>{errorMessage}</p>
                    )}
                  </div>
                  <div className="w-1/2">
                    <label className="block font-semibold mb-1">Cantidad de Cuotas:</label>
                    <select
                      value={cantidadCuotas}
                      onChange={handleCuotasChange}
                      className="border border-gray-300 px-1 py-1 w-20 rounded"
                    >
                      {Array.from({ length: 19 }, (_, i) => i + 11).map((cuota) => (
                        <option key={cuota} value={cuota}>
                          {cuota}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {incluyeEntrega && (
              <div className="mt-4 flex items-center space-x-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={calcularCuota}
                >
                  Calcular Cuota
                </button>

                {incluyeEntrega && montoCuota > 0 && (
                  <div className="flex items-center">
                    <p className="text-lg font-semibold mr-2">Cuota Calculada:</p>
                    <p className="text-xl font-bold text-orange-600">
                      G {mostrarMontoCuotaCalculada()}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <button className="bg-orange-500 text-white px-4 py-2 rounded mr-2" onClick={handleSolicitarCredito}>
                Solicitar Crédito
              </button>
              <button className="bg-green-500 text-white px-4 py-2 rounded">Escríbenos al WhatsApp</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MotosDetalle;
