import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Importar useLocation para recibir el estado
import Swal from "sweetalert2";

function SolicitudCredito() {
  const location = useLocation();
  const navigate = useNavigate(); // Usar para redirigir después del modal
  const {
    modeloSolicitado,
    plan,
    entregaInicial,
    cantidadCuotas,
    montoPorCuota,
  } = location.state || {}; // Recibimos los datos enviados desde MotosDetalle

  const [cedulaIdentidad, setcedulaIdentidad] = useState("");
  const [telefonoMovil, setTelefonoMovil] = useState("");
  const [telefonoLaboral, setTelefonoLaboral] = useState("");
  const [antiguedadAnios, setantiguedadAnios] = useState("");
  const [aportaIps, setAportaIps] = useState(false); // Checkbox para si aporta IPS
  const [cantidadAportes, setCantidadAportes] = useState(""); // Cantidad de aportes IPS
  const [formEnviado, setFormEnviado] = useState(false);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [barrio, setBarrio] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccionParticular, setDireccionParticular] = useState(""); // Dirección particular agregada
  const [empresa, setEmpresa] = useState(""); // Empresa agregada
  const [direccionLaboral, setDireccionLaboral] = useState(""); // Dirección laboral agregada
  const [salario, setSalario] = useState(""); // Salario agregado
  const [documentos, setDocumentos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para manejar el modal adicional
  const [nombresApellidos, setNombresApellidos] = useState("");

  // Obtener la URL base y el path base desde las variables de entorno
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const basePath = import.meta.env.VITE_BASE_PATH || "/api/Motos/";

  // Estado para referencias comerciales
  const [referenciasComerciales, setReferenciasComerciales] = useState([
    { nombreLocal: "", telefono: "" },
    { nombreLocal: "", telefono: "" },
  ]);

  // Estado para referencias personales
  const [referenciasPersonales, setReferenciasPersonales] = useState([
    { nombre: "", telefono: "" },
    { nombre: "", telefono: "" },
    { nombre: "", telefono: "" },
  ]);

  // Agregar el estado de errorMessage
  const [errorMessage, setErrorMessage] = useState("");

  // Desplazar al inicio de la página cuando se cargue
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Validación para cédula y teléfono
  const handlecedulaIdentidadChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Solo números
    if (value.length <= 10) {
      setcedulaIdentidad(value);
    }
  };

  const handleTelefonoChange = (e, setPhone) => {
    const value = e.target.value.replace(/\D/g, ""); // Solo números
    if (value.length <= 15) {
      setPhone(value);
    }
  };

  const handleAportaIpsChange = (e) => {
    setAportaIps(e.target.checked);
    if (!e.target.checked) {
      setCantidadAportes(""); // Si no está marcado, limpiar el campo
    }
  };

  const handleCantidadAportesChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCantidadAportes(value);
  };

  // Manejo de documentos
  const handleDocumentosChange = (e) => {
    setDocumentos(Array.from(e.target.files)); // Convierte los archivos en un array
  };

  const handleReferenciaComercialChange = (index, field, value) => {
    const nuevasReferencias = [...referenciasComerciales];
    nuevasReferencias[index][field] = value;
    setReferenciasComerciales(nuevasReferencias);
  };

  const handleReferenciaPersonalChange = (index, field, value) => {
    const nuevasReferencias = [...referenciasPersonales];
    nuevasReferencias[index][field] = value;
    setReferenciasPersonales(nuevasReferencias);
  };

  // Nueva función para subir documentos adjuntos
  const subirDocumentosAdjuntos = async () => {
    const formData = new FormData();
    documentos.forEach((documento) => {
      formData.append("archivos", documento);
    });

    try {
      const response = await fetch(
        `${apiUrl}${basePath}guardardocumentos?cedula=${cedulaIdentidad}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Error al subir los documentos");
      }
    } catch (error) {
      console.error("Error al subir documentos:", error);
      setErrorMessage("Error al subir los documentos");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const solicitudData = {
      ModeloSolicitado: modeloSolicitado,
      entregaInicial,
      cantidadCuotas,
      montoPorCuota,
      nombresApellidos,
      cedulaIdentidad,
      telefonoMovil,
      telefonoLaboral,
      antiguedadAnios,
      aportaIPS: aportaIps,
      cantidadAportes: cantidadAportes ? parseInt(cantidadAportes) : 0,
      fechaNacimiento,
      barrio,
      ciudad,
      direccionParticular,
      empresa,
      direccionLaboral,
      salario,
      referenciasComerciales: referenciasComerciales.map((ref) => ({
        nombreLocal: ref.nombreLocal,
        telefono: ref.telefono,
      })),
      referenciasPersonales: referenciasPersonales.map((ref) => ({
        nombre: ref.nombre,
        telefono: ref.telefono,
      })),
    };

    try {
      const response = await fetch(`${apiUrl}${basePath}solicitudcredito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(solicitudData), // Enviar los datos correctamente
      });

      if (response.ok) {
        const result = await response.json();
        setFormEnviado(true);
        setErrorMessage("");

        // Subir documentos después de enviar la solicitud
        await subirDocumentosAdjuntos();

        // Mostrar mensaje popup de éxito usando SweetAlert2
        Swal.fire({
          icon: "success",
          title: "Solicitud enviada",
          text: `Solicitud creada exitosamente`,
          showConfirmButton: true,
          confirmButtonColor: "#3085d6",
        }).then(() => {
          // Al cerrar SweetAlert, mostrar el modal con más información
          setIsModalOpen(true);
        });
      } else {
        const result = await response.json();
        setErrorMessage("Ocurrió un error al enviar la solicitud");

        // Mostrar error usando SweetAlert2
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.errors
            ? result.errors.join(", ")
            : "Ocurrió un error al enviar la solicitud",
          showConfirmButton: true,
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      setErrorMessage("Error de conexión con el servidor");
      console.error("Error:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate("/motos"); // Redirigir a la página de motos
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Solicitud de Crédito</h1>

      <form onSubmit={handleSubmit}>
        {/* Modelo Solicitado */}
        <div className="mb-0">
          <label className="block font-bold mb-1 inline">
            Modelo Solicitado:{" "}
          </label>
          <p className="text-gray-700 inline">{modeloSolicitado}</p>{" "}
          {/* Mostrar en una sola línea */}
        </div>

        {/* Plan de Cuotas */}
        <div className="mb-4">
          {/* Detalles del plan sin espacio adicional */}
          <p className="text-gray-700">
            <strong>Entrega Inicial:</strong> G{" "}
            {entregaInicial
              ? Number(entregaInicial).toLocaleString("es-ES")
              : "0"}
          </p>
          <p className="text-gray-700">
            <strong>Cantidad de Cuotas:</strong>{" "}
            {cantidadCuotas ? cantidadCuotas : "0"}
          </p>
          <p className="text-gray-700">
            <strong>Monto por Cuota:</strong> G{" "}
            {montoPorCuota ? montoPorCuota.toLocaleString("es-ES") : "0"}
          </p>
        </div>

        {/* Datos Personales */}
        <h2 className="text-xl font-bold mb-2">Datos Personales</h2>

        <div className="flex space-x-4 mb-4">
          <div className="w-min">
            <label className="block font-semibold mb-1">Cédula</label>
            <input
              type="text"
              maxLength="10" // Limita a 10 caracteres
              value={cedulaIdentidad}
              onChange={handlecedulaIdentidadChange}
              className="border border-gray-300 px-2 py-1 rounded"
              placeholder="Número de Cédula"
              required
            />
          </div>

          <div className="flex-grow">
            <label className="block font-semibold mb-1">
              Nombres y Apellidos
            </label>
            <input
              type="text"
              value={nombresApellidos}
              onChange={(e) => setNombresApellidos(e.target.value)}
              className="border border-gray-300 px-2 py-1 w-full rounded"
              placeholder="Ingrese sus nombres y apellidos"
              required
            />
          </div>
        </div>

        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label className="block font-semibold mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              className="border border-gray-300 px-2 py-1 w-full rounded"
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
          <label className="block font-semibold mb-1">
            Dirección Particular
          </label>
          <input
            type="text"
            value={direccionParticular} // Asegúrate de vincular el estado al input
            onChange={(e) => setDireccionParticular(e.target.value)} // Captura el valor del input
            className="border border-gray-300 px-2 py-1 w-full rounded"
            placeholder="Dirección Particular"
            required
          />
        </div>

        {/* Documentos */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">
            Subir Documentos (Cédula, Ingresos, Boletas)
          </label>
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
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            className="border border-gray-300 px-2 py-1 w-full rounded"
            placeholder="Empresa"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Dirección Laboral</label>
          <input
            type="text"
            value={direccionLaboral}
            onChange={(e) => setDireccionLaboral(e.target.value)}
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
              value={antiguedadAnios}
              onChange={(e) => setantiguedadAnios(e.target.value)}
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
            <label className="block font-semibold mb-1">
              Cantidad de Aportes
            </label>
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
              value={salario}
              onChange={(e) => setSalario(e.target.value)}
              className="border border-gray-300 px-2 py-1 w-full rounded"
              placeholder="Salario"
              required
            />
          </div>
        </div>

        {/* Referencias Comerciales */}
        <h2 className="text-xl font-bold mb-2">Referencias Comerciales</h2>

        {referenciasComerciales.map((referencia, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold mb-1">
              Referencia Comercial {index + 1}
            </h3>
            <div className="flex space-x-4 mb-2">
              <div className="w-1/2">
                <label className="block font-semibold">Nombre Local</label>
                <input
                  type="text"
                  value={referencia.nombreLocal}
                  onChange={(e) =>
                    handleReferenciaComercialChange(
                      index,
                      "nombreLocal",
                      e.target.value
                    )
                  }
                  className="border border-gray-300 px-2 py-1 w-full rounded"
                  placeholder={`Nombre Local ${index + 1}`}
                />
              </div>
              <div className="w-1/2">
                <label className="block font-semibold">Teléfono</label>
                <input
                  type="text"
                  value={referencia.telefono}
                  onChange={(e) =>
                    handleReferenciaComercialChange(
                      index,
                      "telefono",
                      e.target.value
                    )
                  }
                  className="border border-gray-300 px-2 py-1 w-full rounded"
                  placeholder="Teléfono"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Referencias Personales */}
        <h2 className="text-xl font-bold mb-2">Referencias Personales</h2>
        <p className="text-red-500 mb-4">
          2 referencias deben ser de parientes y 1 puede ser compañero laboral o
          amistad. Es válido número de celular o móvil.
        </p>

        {referenciasPersonales.map((referencia, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold mb-1">
              Referencia Personal {index + 1}
            </h3>
            <div className="flex space-x-4 mb-2">
              <div className="w-1/2">
                <label className="block font-semibold">Nombre</label>
                <input
                  type="text"
                  value={referencia.nombre}
                  onChange={(e) =>
                    handleReferenciaPersonalChange(
                      index,
                      "nombre",
                      e.target.value
                    )
                  }
                  className="border border-gray-300 px-2 py-1 w-full rounded"
                  placeholder={`Nombre de la referencia ${index + 1}`}
                />
              </div>
              <div className="w-1/2">
                <label className="block font-semibold">Teléfono</label>
                <input
                  type="text"
                  value={referencia.telefono}
                  onChange={(e) =>
                    handleReferenciaPersonalChange(
                      index,
                      "telefono",
                      e.target.value
                    )
                  }
                  className="border border-gray-300 px-2 py-1 w-full rounded"
                  placeholder={`Teléfono de la referencia ${index + 1}`}
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

        {formEnviado && (
          <p className="text-green-500 mt-4">
            Formulario enviado exitosamente.
          </p>
        )}
        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
      </form>

      {/* Modal de información adicional */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-yellow-100 p-8 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">
              ¡Información importante!
            </h2>
            <p className="text-gray-800 mb-4">
              El equipo de ventas se pondrá en contacto con usted para confirmar
              sus datos para el proceso.
            </p>
            <p className="text-gray-800 mb-4">Muchas gracias por tu interés.</p>
            <div className="flex justify-center">
              {" "}
              {/* Centrar el botón */}
              <button
                onClick={handleCloseModal}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SolicitudCredito;
