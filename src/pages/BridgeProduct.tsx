import { Link, useParams } from "react-router-dom";

const BridgeProduct = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center text-center px-6">
        {/* LOGO CON GLOW Y BORDES SUAVES */}
        <div className="mb-6">
          <img
            src="/logoTuVendedor.png"
            alt="TuVendedor"
            className="
              w-56 md:w-64
              rounded-3xl
              overflow-hidden
              drop-shadow-[0_0_35px_rgba(250,204,21,0.45)]
            "
            loading="eager"
            decoding="async"
          />
        </div>

        {/* BIENVENIDA */}
        <h1 className="text-yellow-400 text-3xl md:text-4xl font-extrabold mb-1">
          ¡Bienvenido!
        </h1>

        {/* SUBTÍTULO */}
        <p className="text-gray-200 text-lg md:text-xl mb-10">
          Tu mejor opción en ventas
        </p>

        {/* BOTÓN CTA */}
        <Link
          to={`/producto/${id}`}
          className="
            bg-yellow-400
            hover:bg-yellow-500
            text-black
            font-bold
            text-lg
            px-10
            py-4
            rounded-2xl
            shadow-[0_0_30px_rgba(250,204,21,0.45)]
            transition
            transform
            hover:scale-105
            active:scale-95
          "
        >
          Ir al producto
        </Link>

        {/* TEXTO FINAL */}
        <p className="text-yellow-400 text-base md:text-lg font-semibold mt-10 tracking-wide">
          Compra y vende fácil, rápido y seguro
        </p>
      </div>
    </div>
  );
};

export default BridgeProduct;
