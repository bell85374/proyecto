const CLAVE_CARRITO = "hazardGameCarrito";

function obtenerCarrito() {
try {
const datos = localStorage.getItem(CLAVE_CARRITO);
const carrito = datos ? JSON.parse(datos) : [];

    if (!Array.isArray(carrito)) {
        return [];
    }

    return carrito
        .filter(function (producto) {
            return (
                producto &&
                typeof producto.id === "string" &&
                typeof producto.nombre === "string" &&
                Number.isFinite(Number(producto.precio)) &&
                Number(producto.precio) >= 0 &&
                Number.isFinite(Number(producto.cantidad)) &&
                Number(producto.cantidad) > 0
            );
        })
        .map(function (producto) {
            return {
                id: producto.id,
                nombre: producto.nombre,
                precio: Number(producto.precio),
                imagen: typeof producto.imagen === "string"
                    ? producto.imagen
                    : "img/icono.png",
                plataforma: typeof producto.plataforma === "string"
                    ? producto.plataforma
                    : "Videojuego",
                cantidad: Math.floor(Number(producto.cantidad))
            };
        })
        .filter(function (producto) {
            return producto.cantidad > 0;
        });
} catch (error) {
    console.error("No se pudo leer el carrito:", error);
    return [];
}

}

function guardarCarrito(carrito) {
try {
localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
actualizarContadores(carrito);
return true;
} catch (error) {
console.error("No se pudo guardar el carrito:", error);
alert("No se pudo guardar el carrito. Revisa el almacenamiento del navegador.");
return false;
}
}

function formatoPrecio(precio) {
return new Intl.NumberFormat("es-CO", {
style: "currency",
currency: "COP",
maximumFractionDigits: 0
}).format(precio);
}

function actualizarContadores(carrito) {
const productos = carrito || obtenerCarrito();

const cantidadTotal = productos.reduce(function (total, producto) {
    return total + producto.cantidad;
}, 0);

document.querySelectorAll("#contador-carrito, .contador").forEach(
    function (contador) {
        contador.textContent = cantidadTotal;
    }
);

}

function agregarProducto(producto) {
const carrito = obtenerCarrito();

const existente = carrito.find(function (item) {
    return item.id === producto.id;
});

if (existente) {
    existente.cantidad += 1;
} else {
    carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: Number(producto.precio),
        imagen: producto.imagen || "img/icono.png",
        plataforma: producto.plataforma || "Videojuego",
        cantidad: 1
    });
}

return guardarCarrito(carrito);

}

function crearElemento(etiqueta, clase, texto) {
const elemento = document.createElement(etiqueta);

if (clase) {
    elemento.className = clase;
}

if (texto !== undefined) {
    elemento.textContent = texto;
}

return elemento;

}

function crearProductoCarrito(producto) {
const fila = crearElemento("article", "producto-carrito");

const contenedorImagen = crearElemento("div", "imagen-producto");
const imagen = document.createElement("img");

imagen.src = producto.imagen || "img/icono.png";
imagen.alt = producto.nombre;
imagen.loading = "lazy";

imagen.addEventListener("error", function () {
    imagen.onerror = null;
    imagen.src = "img/icono.png";
});

contenedorImagen.appendChild(imagen);

const detalle = crearElemento("div", "detalle-producto");

const plataforma = crearElemento(
    "span",
    "plataforma",
    producto.plataforma
);

const nombre = crearElemento("h3", "", producto.nombre);

const precioUnitario = crearElemento(
    "p",
    "precio-unitario",
    formatoPrecio(producto.precio) + " por unidad"
);

const controles = crearElemento("div", "controles-cantidad");

const botonMenos = crearElemento("button", "", "−");
botonMenos.type = "button";
botonMenos.setAttribute(
    "aria-label",
    "Disminuir cantidad de " + producto.nombre
);

botonMenos.addEventListener("click", function () {
    cambiarCantidad(producto.id, -1);
});

const cantidad = crearElemento(
    "span",
    "",
    String(producto.cantidad)
);

const botonMas = crearElemento("button", "", "+");
botonMas.type = "button";
botonMas.setAttribute(
    "aria-label",
    "Aumentar cantidad de " + producto.nombre
);

botonMas.addEventListener("click", function () {
    cambiarCantidad(producto.id, 1);
});

controles.append(botonMenos, cantidad, botonMas);

detalle.append(
    plataforma,
    nombre,
    precioUnitario,
    controles
);

const precioProducto = crearElemento("div", "precio-producto");

const subtotal = crearElemento(
    "strong",
    "",
    formatoPrecio(producto.precio * producto.cantidad)
);

const botonEliminar = crearElemento(
    "button",
    "boton-eliminar",
    "Eliminar"
);

botonEliminar.type = "button";

botonEliminar.addEventListener("click", function () {
    eliminarProducto(producto.id);
});

precioProducto.append(subtotal, botonEliminar);
fila.append(contenedorImagen, detalle, precioProducto);

return fila;

}

function mostrarCarrito() {
const carrito = obtenerCarrito();

const lista = document.getElementById("lista-carrito");
const carritoVacio = document.getElementById("carrito-vacio");
const textoCantidad = document.getElementById("texto-cantidad");
const resumenCantidad = document.getElementById("resumen-cantidad");
const subtotalElemento = document.getElementById("subtotal");
const totalElemento = document.getElementById("total");
const botonVaciar = document.getElementById("vaciar-carrito");
const botonFinalizar = document.getElementById("finalizar-compra");

const cantidadTotal = carrito.reduce(function (total, producto) {
    return total + producto.cantidad;
}, 0);

const subtotalTotal = carrito.reduce(function (total, producto) {
    return total + producto.precio * producto.cantidad;
}, 0);

if (lista) {
    lista.replaceChildren();

    carrito.forEach(function (producto) {
        lista.appendChild(crearProductoCarrito(producto));
    });

    lista.hidden = carrito.length === 0;
}

if (carritoVacio) {
    carritoVacio.hidden = carrito.length !== 0;
}

if (textoCantidad) {
    textoCantidad.textContent =
        cantidadTotal +
        (cantidadTotal === 1
            ? " producto en tu carrito"
            : " productos en tu carrito");
}

if (resumenCantidad) {
    resumenCantidad.textContent = cantidadTotal;
}

if (subtotalElemento) {
    subtotalElemento.textContent = formatoPrecio(subtotalTotal);
}

if (totalElemento) {
    totalElemento.textContent = formatoPrecio(subtotalTotal);
}

if (botonVaciar) {
    botonVaciar.disabled = carrito.length === 0;
}

if (botonFinalizar) {
    botonFinalizar.disabled = carrito.length === 0;
}

actualizarContadores(carrito);

}

function cambiarCantidad(id, cambio) {
const carrito = obtenerCarrito();

const producto = carrito.find(function (item) {
    return item.id === id;
});

if (!producto) {
    return;
}

producto.cantidad += cambio;

const carritoActualizado = carrito.filter(function (item) {
    return item.cantidad > 0;
});

if (guardarCarrito(carritoActualizado)) {
    mostrarCarrito();
}

}

function eliminarProducto(id) {
const carrito = obtenerCarrito().filter(function (producto) {
return producto.id !== id;
});

if (guardarCarrito(carrito)) {
    mostrarCarrito();
}

}

function vaciarCarrito() {
const carrito = obtenerCarrito();

if (carrito.length === 0) {
    return;
}

const confirmar = window.confirm(
    "¿Seguro que quieres eliminar todos los productos del carrito?"
);

if (confirmar && guardarCarrito([])) {
    mostrarCarrito();
}

}

document.addEventListener("DOMContentLoaded", function () {
actualizarContadores();
mostrarCarrito();

const botonVaciar = document.getElementById("vaciar-carrito");

if (botonVaciar) {
    botonVaciar.addEventListener("click", vaciarCarrito);
}

const botonFinalizar = document.getElementById("finalizar-compra");

if (botonFinalizar) {
    botonFinalizar.addEventListener("click", function () {
        const carrito = obtenerCarrito();

        if (carrito.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        alert(
            "Esta es una tienda académica. La función de pago todavía no está conectada."
        );
    });
}

// Evita procesar dos veces el mismo clic.
// Se registra una sola vez al cargar la página.
document.addEventListener("click", function (evento) {
    const elemento = evento.target;

    if (!(elemento instanceof Element)) {
        return;
    }

    const boton = elemento.closest(".agregar-carrito");

    if (!boton) {
        return;
    }

    evento.preventDefault();

    if (boton.dataset.procesando === "true") {
        return;
    }

    const id = boton.dataset.id;
    const nombre = boton.dataset.nombre;
    const precioTexto = boton.dataset.precio;
    const precio = Number(precioTexto);
    const imagen = boton.dataset.imagen || "img/icono.png";
    const plataforma = boton.dataset.plataforma || "Videojuego";

    if (
        !id ||
        !nombre ||
        precioTexto === undefined ||
        precioTexto.trim() === "" ||
        !Number.isFinite(precio) ||
        precio < 0
    ) {
        console.error("El botón no tiene todos los datos válidos del producto.");
        alert("No se pudo agregar el juego. Revisa los datos del producto.");
        return;
    }

    // Bloquea el botón antes de guardar para evitar dobles clics.
    boton.dataset.procesando = "true";

    const guardado = agregarProducto({
        id: id,
        nombre: nombre,
        precio: precio,
        imagen: imagen,
        plataforma: plataforma
    });

    if (guardado) {
        window.location.href =
            boton.getAttribute("href") || "carrito.html";
    } else {
        boton.dataset.procesando = "false";
    }
});

});

window.addEventListener("storage", function (evento) {
if (evento.key === CLAVE_CARRITO) {
mostrarCarrito();
}
});