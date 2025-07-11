import type { Producto } from "../types/producto";

export const productosMock: Producto[] = [
  {
    id: 1,
    nombre: "Moto Honda Wave 110",
    precio: 8500000,
    categoria: "Vehículos",
    ubicacion: "Luque",
    imagen: "/images/moto.webp",
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
    imagen: "/images/terreno.webp",
    vendedor: {
      nombre: "Fátima Bienes Raíces",
      avatar: "/assets/fatima.jpg",
    },
  },
  {
    id: 3,
    nombre: "Toyota IST 2008",
    precio: 38000000,
    categoria: "Vehículos",
    ubicacion: "Asunción",
    imagen: "/images/ist.webp",
    vendedor: {
      nombre: "Autos López",
      avatar: "/assets/lopez.jpg",
    },
  },
  {
    id: 4,
    nombre: "Lote en Itauguá",
    precio: 45000000,
    categoria: "Propiedades",
    ubicacion: "Itauguá",
    imagen: "/images/itagua.webp",
    vendedor: {
      nombre: "Lotes Express",
      avatar: "/assets/express.jpg",
    },
  },
  {
    id: 5,
    nombre: "Heladera Whirlpool 400L",
    precio: 3200000,
    categoria: "Electrodomésticos",
    ubicacion: "San Lorenzo",
    imagen: "/assets/heladera.webp",
    vendedor: {
      nombre: "Electro Jet",
      avatar: "/assets/electrojet.jpg",
    },
  },
  {
    id: 6,
    nombre: "TV Samsung 55'' UHD",
    precio: 3500000,
    categoria: "Electrodomésticos",
    ubicacion: "Fernando de la Mora",
    imagen: "/assets/tv55.webp",
    vendedor: {
      nombre: "Electronova",
      avatar: "/assets/electronova.jpg",
    },
  },
  {
    id: 7,
    nombre: "Moto Kenton GTR 150",
    precio: 10500000,
    categoria: "Vehículos",
    ubicacion: "Capiatá",
    imagen: "/images/kenton.webp",
    vendedor: {
      nombre: "Moto Flash",
      avatar: "/assets/flash.jpg",
    },
  },
  {
    id: 8,
    nombre: "Lote céntrico en Limpio",
    precio: 90000000,
    categoria: "Propiedades",
    ubicacion: "Limpio",
    imagen: "/images/centro.webp",
    vendedor: {
      nombre: "Bienes Limpios",
      avatar: "/assets/limpios.jpg",
    },
  },
  {
    id: 9,
    nombre: "Aire Split TCL 3000 Frigorías",
    precio: 2800000,
    categoria: "Electrodomésticos",
    ubicacion: "Ñemby",
    imagen: "/assets/aire.webp",
    vendedor: {
      nombre: "CoolTech",
      avatar: "/assets/cooltech.jpg",
    },
  },
  {
    id: 10,
    nombre: "Fiat Palio 2012",
    precio: 29000000,
    categoria: "Vehículos",
    ubicacion: "Villa Elisa",
    imagen: "/images/fiatpalio.webp",
    vendedor: {
      nombre: "Fiat Market",
      avatar: "/assets/fiatmarket.jpg",
    },
  },
];
