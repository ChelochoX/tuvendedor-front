import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function MotosDetalle() {
  const location = useLocation();
  const navigate = useNavigate();
  const { images, title, isPromo } = location.state || {};

  const [mainImage, setMainImage] = useState(images ? images[0] : "");
  const [producto, setProducto] = useState(null);
  const [precioContado, setPrecioContado] = useState(0);
  const [cuotaMasBaja, setCuotaMasBaja] = useState(0);
  const [entregaInicial, setEntregaInicial] = useState("");
  const [cantidadCuotas, setCantidadCuotas] = useState(12);
  const [incluyeEntrega, setIncluyeEntrega] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [montoPorCuota, setMontoPorCuota] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Variables de estado adicionales para productos en promoción
  const [precioPublicoPromo, setPrecioPublicoPromo] = useState(null);
  const [planesPromo, setPlanesPromo] = useState([]);
  const [selectedPlanPromo, setSelectedPlanPromo] = useState(null);
  const [cuotaMasBajaPromo, setCuotaMasBajaPromo] = useState(0);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const basePath = import.meta.env.VITE_BASE_PATH || "/api/Motos/";

  useEffect(() => {
    const obtenerDatosProducto = async () => {
      try {
        const modeloFormateado = encodeURIComponent(
          title.replace("×", "x").trim()
        );
        const endpoint = isPromo
          ? `${apiUrl}${basePath}productopromo/${modeloFormateado}`
          : `${apiUrl}${basePath}producto/${modeloFormateado}`;

        console.log("Endpoint seleccionado:", endpoint);

        const response = await axios.get(endpoint);
        const data = response.data;

        // Asignar datos comunes
        setProducto(data);
        setPrecioContado(data.precioPublico);

        // Validación para evitar el error si `data.planes` está vacío
        if (data.planes && data.planes.length > 0) {
          setSelectedPlan(data.planes[0]);
          setCuotaMasBaja(data.planes[0].importe);
        }

        // Si es promoción, asignar también los datos promocionales
        if (isPromo) {
          setPrecioPublicoPromo(data.precioPublicoPromo);
          setPlanesPromo(data.planes); // Usamos `data.planes` para los datos promocionales

          // Validación para evitar el error si `data.planes` está vacío
          if (data.planes.length > 0) {
            setSelectedPlanPromo(data.planes[0]);
            setCuotaMasBajaPromo(data.planes[0].importePromo);
          }
        }
      } catch (error) {
        console.error("Error al obtener los datos del producto:", error);
      }
    };

    obtenerDatosProducto();
  }, [title, isPromo]);

  // useEffect para desplazar la vista hacia la parte superior al cargar el componente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []); // Este efecto solo se ejecuta cuando el componente se monta

  const formatNumber = (value) => {
    if (!value) return "";
    const number = parseFloat(value.replace(/\./g, "").replace(",", "."));
    return isNaN(number)
      ? ""
      : number.toLocaleString("es-ES", { maximumFractionDigits: 0 });
  };

  const handleEntregaInicialChange = (e) => {
    const value = e.target.value.replace(/\./g, "");
    setEntregaInicial(formatNumber(value));
  };

  const handleCheckboxChange = () => {
    setIncluyeEntrega(!incluyeEntrega);
    setMontoPorCuota(0);

    if (incluyeEntrega) {
      const primerPlan = isPromo ? planesPromo[0] : producto.planes[0];
      setSelectedPlan(isPromo ? selectedPlanPromo : primerPlan);
      setCuotaMasBaja(isPromo ? cuotaMasBajaPromo : primerPlan.importe);
      setCantidadCuotas(primerPlan.cuotas);
    }
  };

  const handleCuotasChange = (e) => {
    setCantidadCuotas(parseInt(e.target.value));
  };

  const calcularCuota = async () => {
    if (!entregaInicial || parseFloat(entregaInicial.replace(/\./g, "")) <= 0) {
      setErrorMessage("La entrega inicial no puede estar vacio.");
      return;
    }
    setErrorMessage("");
    if (incluyeEntrega) {
      try {
        const response = await axios.post(
          `${apiUrl}${basePath}producto/calcularcuota`,
          {
            modeloSolicitado: title,
            entregaInicial: entregaInicial.replace(/\./g, ""),
            cantidadCuotas: cantidadCuotas,
          }
        );

        if (typeof response.data === "number") {
          setMontoPorCuota(response.data);
        } else if (response.data.montoPorCuota) {
          setMontoPorCuota(response.data.montoPorCuota);
        }
      } catch (error) {
        console.error("Error al calcular el monto de la cuota:", error);
      }
    }
  };

  const handlePlanChange = (e) => {
    const selectedPlanId = parseInt(e.target.value);
    const planSeleccionado = (isPromo ? planesPromo : producto.planes).find(
      (plan) => plan.idPlan === selectedPlanId
    );
    if (isPromo) {
      setSelectedPlanPromo(planSeleccionado);
      setCuotaMasBajaPromo(planSeleccionado.importePromo);
    } else {
      setSelectedPlan(planSeleccionado);
      setCuotaMasBaja(planSeleccionado.importe);
    }
  };

  const mostrarmontoPorCuotaCalculada = () => {
    return montoPorCuota > 0 ? montoPorCuota.toLocaleString("es-ES") : "0";
  };

  const handleSolicitarCredito = () => {
    const datosPlan = {
      modeloSolicitado: title,
      plan: isPromo ? selectedPlanPromo.nombrePlan : selectedPlan.nombrePlan,
      entregaInicial: incluyeEntrega
        ? entregaInicial.replace(/\./g, "")
        : isPromo
        ? selectedPlanPromo.entregaPromo
        : selectedPlan.entrega,
      cantidadCuotas: isPromo
        ? selectedPlanPromo?.cuotasPromo
        : selectedPlan?.cuotas,
      montoPorCuota: isPromo ? cuotaMasBajaPromo : cuotaMasBaja,
    };

    navigate("/solicitarcredito", { state: datosPlan });
  };

  if (!images || images.length === 0) {
    return <div>Error: No se encontraron imágenes para este modelo.</div>;
  }

  const handleWhatsAppClick = () => {
    const numeroWhatsApp = "595991645806"; // Reemplaza con el número del vendedor
    const modelo = title; // Nombre del modelo (ej. SPARK 150)
    const plan = isPromo
      ? selectedPlanPromo?.nombrePlan
      : selectedPlan?.nombrePlan; // Nombre del plan seleccionado
    const entrega = isPromo
      ? selectedPlanPromo?.entregaPromo
      : selectedPlan?.entrega; // Monto de la entrega inicial
    const cuota = isPromo
      ? selectedPlanPromo?.cuotasPromo
      : selectedPlan?.cuotas; // Cantidad de cuotas
    const montoCuota = isPromo ? cuotaMasBajaPromo : cuotaMasBaja; // Monto por cuota

    // Crear el mensaje en formato legible
    const mensaje = `
    ¡He visto este modelo en la página Tu Vendedor:
    - Modelo: ${modelo} !!
    - En este Plan: ${plan}
    - Entrega Inicial: G ${entrega?.toLocaleString("es-ES")}
    - Cantidad de Cuotas: ${cuota}
    - Monto por Cuota: G ${montoCuota?.toLocaleString("es-ES")}
  
    Me gustaría más detalles de este modelo. ¡Gracias!
    `;

    // Generar el enlace de WhatsApp con el mensaje codificado
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row">
        {/* Sección de imagen principal */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="w-full h-auto max-h-96">
            <img
              src={`${apiUrl}${mainImage}`}
              alt={title}
              className="w-full h-full object-contain max-h-96"
            />
          </div>
          <div className="flex justify-center mt-4 flex-wrap space-x-2">
            {images.map((image, index) => (
              <img
                key={index}
                src={`${apiUrl}${image}`}
                alt={`${title} vista ${index + 1}`}
                className={`w-12 h-12 object-contain cursor-pointer border ${
                  mainImage === image ? "border-orange-500" : "border-gray-300"
                }`}
                onClick={() => setMainImage(image)}
              />
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2 pl-0 md:pl-8 mt-8 md:mt-0">
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>

          {isPromo ? (
            <>
              <p className="text-gray-500 font-semibold mt-2 text-sm md:text-base line-through">
                Precio original: G {precioContado.toLocaleString()}
              </p>
              <p className="text-red-600 font-semibold mt-2 text-sm md:text-base">
                Precio promocional: G {precioPublicoPromo?.toLocaleString()}
              </p>
              <p className="text-green-600 font-semibold mt-1 text-sm md:text-base">
                ¡Aprovecha esta oferta por tiempo limitado!
              </p>
            </>
          ) : (
            <>
              <p className="text-black font-semibold mt-2 text-sm md:text-base">
                Precio contado: G {precioContado.toLocaleString()}
              </p>
              <p className="text-green-600 font-semibold mt-1 text-sm md:text-base">
                ¡Obtén un descuento especial al pagar al contado!
              </p>
            </>
          )}

          <div className="mt-6">
            {!incluyeEntrega && ( // Solo mostrar el selector si no está chequeado el checkbox
              <>
                <h3 className="text-md md:text-lg font-semibold mb-2">
                  Planes de financiamiento:
                </h3>
                <select
                  className="border border-gray-300 px-2 py-1 rounded w-full"
                  onChange={handlePlanChange}
                >
                  {(isPromo ? planesPromo : producto?.planes)?.map((plan) => (
                    <option key={plan.idPlan} value={plan.idPlan}>
                      {plan.nombrePlan}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* Ocultar esta sección si incluyeEntrega está activado */}
          {!incluyeEntrega && (
            <div className="mt-4 flex flex-col items-center md:flex-row md:justify-between">
              {selectedPlan && selectedPlan.entrega > 0 && (
                <div className="mb-4 md:mb-0 flex-1 text-center">
                  <label className="block font-semibold mb-1 text-sm md:text-base">
                    Entrega Inicial:
                  </label>
                  <p className="text-lg md:text-xl font-bold text-orange-600">
                    G{" "}
                    {(isPromo
                      ? selectedPlanPromo?.entregaPromo
                      : selectedPlan.entrega
                    )?.toLocaleString("es-ES")}
                  </p>
                </div>
              )}

              {selectedPlan && (
                <div className="mb-4 md:mb-0 flex-1 text-center">
                  <label className="block font-semibold mb-1 text-sm md:text-base">
                    Cantidad de Cuotas:
                  </label>
                  <p className="text-lg md:text-xl font-bold text-orange-600">
                    {isPromo
                      ? selectedPlanPromo?.cuotasPromo
                      : selectedPlan.cuotas}
                  </p>
                </div>
              )}

              <div className="flex-1 text-center">
                <label className="block font-semibold mb-1 text-sm md:text-base">
                  Monto por Cuota:
                </label>
                <p className="text-lg md:text-xl font-bold text-orange-600">
                  G{" "}
                  {(isPromo ? cuotaMasBajaPromo : cuotaMasBaja)?.toLocaleString(
                    "es-ES"
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Mostrar el checkbox de "Calcular con entrega mayor" solo si no es promoción */}
          {!isPromo && (
            <div className="mt-6">
              <div className="flex items-center mb-4 space-x-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incluyeEntrega}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-orange-500 rounded focus:ring-0 cursor-pointer"
                  />
                  <span className="ml-2 text-sm md:text-base text-gray-700">
                    Calcular con entrega mayor
                  </span>
                </label>
              </div>
              {incluyeEntrega && (
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <div className="w-full md:w-1/2">
                    <label className="block font-semibold mb-1 text-sm md:text-base">
                      Entrega Inicial:
                    </label>
                    <input
                      type="text"
                      value={entregaInicial}
                      onChange={handleEntregaInicialChange}
                      className="border border-gray-300 px-2 py-1 w-full rounded"
                      placeholder="Monto de entrega inicial"
                      min="0"
                    />
                    {errorMessage && (
                      <p className="text-red-500 text-sm mt-1">
                        {errorMessage}
                      </p>
                    )}
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block font-semibold mb-1 text-sm md:text-base">
                      Cantidad de Cuotas:
                    </label>
                    <select
                      value={cantidadCuotas}
                      onChange={handleCuotasChange}
                      className="border border-gray-300 px-2 py-1 w-full rounded"
                    >
                      {Array.from({ length: 19 }, (_, i) => i + 11).map(
                        (cuota) => (
                          <option key={cuota} value={cuota}>
                            {cuota}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {incluyeEntrega && (
            <div className="mt-4 flex flex-col md:flex-row items-center md:space-x-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={calcularCuota}
              >
                Calcular Cuota
              </button>

              {incluyeEntrega && montoPorCuota > 0 && (
                <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center text-sm md:text-base">
                  <p className="font-semibold mr-2">Cuota Calculada:</p>
                  <p className="text-lg md:text-xl font-bold text-orange-600">
                    G {mostrarmontoPorCuotaCalculada()}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded w-full md:w-auto"
              onClick={handleSolicitarCredito}
            >
              Solicitar Crédito
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded w-full md:w-auto"
              onClick={handleWhatsAppClick}
            >
              Escríbenos al WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MotosDetalle;
