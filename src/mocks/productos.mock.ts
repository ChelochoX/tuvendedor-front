import type { Producto } from "../types/producto";

export const productosMock: Producto[] = [
  {
    id: 1,
    nombre: "Moto Honda Wave 110",
    precio: 8500000,
    categoria: "Vehículos",
    ubicacion: "Luque",
    imagen: "/assets/moto.jpg",
    vendedor: {
      nombre: "Ña Elo",
      avatar: "/assets/elo.jpg",
    },
  },
  {
    id: 2,
    nombre: "Terreno en Mariano",
    precio: 120000000,
    categoria: "Propiedades",
    ubicacion: "Mariano Roque Alonso",
    imagen: "/assets/terreno.jpg",
    vendedor: {
      nombre: "Fátima Bienes Raíces",
      avatar: "/assets/fatima.jpg",
    },
  },
];
