# Velora

Tienda de ropa y accesorios artesanales. Portada editorial, catálogo con descuentos, carrito que arma el pedido en WhatsApp, pie de contacto con mapa y un **Estudio** protegido por contraseña para editar textos, fotos, precios y redes.

## Páginas

| Ruta | Qué es |
|---|---|
| `/` | Portada |
| `/promociones` | Catálogo (el nombre se puede cambiar a «Ropa» en el Estudio) |
| `/estudio` | Panel del dueño |

## Arranque local

```bash
npm install
npm run dev
```

Abre [http://localhost:8080](http://localhost:8080).

- Contraseña inicial del Estudio: `velora` (cámbiala dentro del panel).
- Pon tu WhatsApp con código de país, por ejemplo `5215512345678`.
- Los cambios del Estudio se guardan en la base (PGLite en local; Postgres si defines `DATABASE_URL`).

```bash
npm run build
npm run typecheck
```

## Archivo único

`velora.html` es el mismo sitio empaquetado (HTML + CSS + JS + fotos). Ábrelo en el navegador: no necesita servidor. Lo que edites ahí queda en ese navegador (`localStorage`).

## Pedidos

El cliente arma el carrito y pulsa **Pedir por WhatsApp**. En el Estudio ves el pedido y puedes ocultar esas piezas si ya no están.
