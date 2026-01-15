import { useState } from "react";
import ListarInteresados from "./ListarInteresados";
import { Interesado } from "../../types/clientes";

const ListarInteresadosRoute = () => {
  const [seleccionado, setSeleccionado] = useState<Interesado | null>(null);
  const [recargarLista, setRecargarLista] = useState(false);

  return (
    <ListarInteresados
      seleccionado={seleccionado}
      setSeleccionado={setSeleccionado}
      recargarLista={recargarLista}
      setRecargarLista={setRecargarLista}
    />
  );
};

export default ListarInteresadosRoute;
