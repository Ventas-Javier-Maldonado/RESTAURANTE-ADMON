/* =========================================================
   CONTROL RESTAURANTE
   SISTEMA PRINCIPAL
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    iniciarAplicacion();
});


/* =========================================================
   CONFIGURACIÓN GENERAL
   ========================================================= */

const CLAVE_JORNADA = "jornada_restaurante";
const CLAVE_EMPLEADOS = "empleados_restaurante";
const CLAVE_INVENTARIO = "inventario_restaurante";
const CLAVE_MOVIMIENTOS = "movimientos_inventario_restaurante";

const USUARIO_ACTUAL = {
    nombre: "Administrador",
    rol: "Administrador"
};


/* =========================================================
   INICIO DE LA APLICACIÓN
   ========================================================= */

function iniciarAplicacion() {

    const jornada = obtenerJornadaActual();

    if (!jornada) {
        mostrarPantallaJornada();
        return;
    }

    mostrarDashboard(jornada);
}


/* =========================================================
   FECHA ACTUAL
   ========================================================= */

function obtenerFechaActual() {

    const ahora = new Date();

    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}


function obtenerFechaFormateada() {

    const ahora = new Date();

    return ahora.toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


function obtenerHoraActual() {

    const ahora = new Date();

    return ahora.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================================================
   JORNADA
   ========================================================= */

function obtenerJornadaActual() {

    const datos = localStorage.getItem(CLAVE_JORNADA);

    if (!datos) {
        return null;
    }

    try {

        const jornada = JSON.parse(datos);

        if (jornada.fecha !== obtenerFechaActual()) {
            return null;
        }

        return jornada;

    } catch (error) {

        console.error(
            "Error al leer la jornada:",
            error
        );

        return null;
    }
}


/* =========================================================
   PANTALLA INICIAR JORNADA
   ========================================================= */

function mostrarPantallaJornada() {

    const app = document.getElementById("app");

    app.innerHTML = `
        <main class="pantalla-jornada">

            <section class="jornada-card">

                <div class="jornada-icono">
                    ✓
                </div>

                <div class="jornada-etiqueta">
                    CONTROL RESTAURANTE
                </div>

                <h1>
                    ¡Buenos días!
                </h1>

                <p class="jornada-fecha">
                    ${capitalizar(obtenerFechaFormateada())}
                </p>

                <div class="jornada-separador"></div>

                <p class="jornada-pregunta">
                    ¿Listo para comenzar tu jornada?
                </p>

                <p class="jornada-info">
                    Al iniciar registrarás oficialmente
                    tu hora de entrada.
                </p>

                <button
                    class="btn-jornada"
                    type="button"
                    onclick="iniciarJornada()">

                    <span>
                        ▶
                    </span>

                    INICIAR JORNADA

                </button>

                <p class="jornada-rol">
                    ${USUARIO_ACTUAL.nombre}
                    ·
                    ${USUARIO_ACTUAL.rol}
                </p>

            </section>

        </main>
    `;
}


/* =========================================================
   INICIAR JORNADA
   ========================================================= */

function iniciarJornada() {

    const jornada = {
        fecha: obtenerFechaActual(),
        entrada: new Date().toISOString(),
        salida: null,
        usuario: USUARIO_ACTUAL.nombre,
        estado: "Activa"
    };

    localStorage.setItem(
        CLAVE_JORNADA,
        JSON.stringify(jornada)
    );

    mostrarDashboard(jornada);
}


/* =========================================================
   TERMINAR JORNADA
   ========================================================= */

function terminarJornada() {

    const jornada =
        obtenerJornadaActual();

    if (!jornada) {
        return;
    }

    const confirmar =
        confirm(
            "¿Deseas registrar tu salida de la jornada?"
        );

    if (!confirmar) {
        return;
    }

    jornada.salida =
        new Date().toISOString();

    jornada.estado =
        "Terminada";

    localStorage.setItem(
        CLAVE_JORNADA,
        JSON.stringify(jornada)
    );

    mostrarDashboard(jornada);
}


/* =========================================================
   HORAS TRABAJADAS
   ========================================================= */

function calcularHorasTrabajadas(jornada) {

    if (!jornada || !jornada.entrada) {
        return "0 h 00 min";
    }

    const inicio =
        new Date(jornada.entrada);

    const fin =
        jornada.salida
            ? new Date(jornada.salida)
            : new Date();

    const diferencia =
        Math.max(
            0,
            fin - inicio
        );

    const minutos =
        Math.floor(
            diferencia / 60000
        );

    const horas =
        Math.floor(
            minutos / 60
        );

    const minutosRestantes =
        minutos % 60;

    return `${horas} h ${String(
        minutosRestantes
    ).padStart(2, "0")} min`;
}


function mostrarDashboard(jornada) {

    const app =
        document.getElementById("app");

    const inventario =
        obtenerInventario();

    const productosBajoMinimo =
        obtenerProductosBajoMinimo(
            inventario
        );

    app.innerHTML = `

        <div class="sistema">

            <header class="topbar">

                <div class="marca">

                    <div class="marca-icono">
                        CR
                    </div>

                    <div>

                        <strong>
                            Control Restaurante
                        </strong>

                        <small>
                            Administración
                        </small>

                    </div>

                </div>


                <button
                    class="usuario-boton"
                    type="button">

                    <span class="usuario-avatar">
                        ${obtenerIniciales(
                            USUARIO_ACTUAL.nombre
                        )}
                    </span>

                    <span class="usuario-info">

                        <strong>
                            ${USUARIO_ACTUAL.nombre}
                        </strong>

                        <small>
                            ${USUARIO_ACTUAL.rol}
                        </small>

                    </span>

                </button>

            </header>


            <main class="contenido">


                <section class="bienvenida">

                    <div>

                        <div class="etiqueta">
                            PANEL PRINCIPAL
                        </div>

                        <h1>
                            Buen día,
                            ${USUARIO_ACTUAL.nombre}
                        </h1>

                        <p>
                            Control y operación
                            del restaurante.
                        </p>

                    </div>

                </section>


                <section class="jornada-resumen">

                    <div class="jornada-resumen-icono">
                        ✓
                    </div>

                    <div>

                        <span>
                            JORNADA
                        </span>

                        <strong>
                            ${
                                jornada.estado === "Activa"
                                    ? "Jornada iniciada"
                                    : "Jornada terminada"
                            }
                        </strong>

                        <small>
                            Entrada:
                            ${
                                jornada.entrada
                                    ? new Date(
                                        jornada.entrada
                                    ).toLocaleTimeString(
                                        "es-MX",
                                        {
                                            hour:
                                                "2-digit",
                                            minute:
                                                "2-digit"
                                        }
                                    )
                                    : "--:--"
                            }
                        </small>

                    </div>


                    ${
                        jornada.estado === "Activa"
                            ? `
                                <button
                                    class="btn-jornada-salida"
                                    type="button"
                                    onclick="terminarJornada()">

                                    TERMINAR JORNADA

                                </button>
                            `
                            : `
                                <div class="jornada-terminada">
                                    Jornada terminada
                                </div>
                            `
                    }

                </section>


                <section class="indicadores">


                    <article class="indicador">

                        <div class="indicador-icono">
                            💰
                        </div>

                        <div>

                            <span>
                                INGRESOS
                            </span>

                            <strong>
                                $0.00
                            </strong>

                            <small>
                                Hoy
                            </small>

                        </div>

                    </article>


                    <article class="indicador">

                        <div class="indicador-icono">
                            📉
                        </div>

                        <div>

                            <span>
                                EGRESOS
                            </span>

                            <strong>
                                $0.00
                            </strong>

                            <small>
                                Hoy
                            </small>

                        </div>

                    </article>


                    <article class="indicador">

                        <div class="indicador-icono">
                            📊
                        </div>

                        <div>

                            <span>
                                UTILIDAD
                            </span>

                            <strong>
                                $0.00
                            </strong>

                            <small>
                                Hoy
                            </small>

                        </div>

                    </article>


                    <article class="indicador">

                        <div class="indicador-icono">
                            📦
                        </div>

                        <div>

                            <span>
                                INVENTARIO
                            </span>

                            <strong>
                                ${inventario.length}
                            </strong>

                            <small>
                                Productos
                            </small>

                        </div>

                    </article>

                </section>


                ${
                    productosBajoMinimo.length
                        ? `
                            <section class="alerta-inventario">

                                <div class="alerta-icono">
                                    ⚠️
                                </div>

                                <div>

                                    <strong>
                                        Atención de inventario
                                    </strong>

                                    <span>
                                        ${
                                            productosBajoMinimo.length
                                        }
                                        producto(s)
                                        están en su mínimo
                                        o por debajo.
                                    </span>

                                </div>

                                <button
                                    type="button"
                                    onclick="mostrarInventario()">

                                    Revisar

                                </button>

                            </section>
                        `
                        : ""
                }


                <section class="panel">

                    <div class="panel-cabecera">

                        <div>

                            <span>
                                ACCESOS RÁPIDOS
                            </span>

                            <h2>
                                Operación
                            </h2>

                        </div>

                    </div>


                    <div class="accesos">


                        <button
                            type="button"
                            onclick="mostrarPersonal()">

                            <span>
                                👥
                            </span>

                            <span>
                                Personal
                            </span>

                        </button>


                        <button
                            type="button"
                            onclick="mostrarInventario()">

                            <span>
                                📦
                            </span>

                            <span>
                                Inventario
                            </span>

                        </button>


                       <button
    type="button"
    onclick="mostrarProductosVenta()">

    <span>
        🍽️
    </span>

    <span>
        Productos de venta
    </span>

</button>


<button
    type="button">

    <span>
        🧾
    </span>

    <span>
        Tickets
    </span>

</button>


                        <button
                            type="button">

                            <span>
                                💵
                            </span>

                            <span>
                                Caja
                            </span>

                        </button>

                        <button
    type="button"
    onclick="mostrarVentas()">

    <span>
        🛒
    </span>

    <span>
        Ventas
    </span>

</button>

                    </div>

                </section>


                <section class="panel">

                    <div class="panel-cabecera">

                        <div>

                            <span>
                                RESUMEN
                            </span>

                            <h2>
                                Jornada actual
                            </h2>

                        </div>

                    </div>


                    <div class="resumen-jornada">

                        <div>

                            <span>
                                Entrada
                            </span>

                            <strong>
                                ${
                                    jornada.entrada
                                        ? new Date(
                                            jornada.entrada
                                        ).toLocaleTimeString(
                                            "es-MX",
                                            {
                                                hour:
                                                    "2-digit",
                                                minute:
                                                    "2-digit"
                                            }
                                        )
                                        : "--:--"
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Salida
                            </span>

                            <strong>
                                ${
                                    jornada.salida
                                        ? new Date(
                                            jornada.salida
                                        ).toLocaleTimeString(
                                            "es-MX",
                                            {
                                                hour:
                                                    "2-digit",
                                                minute:
                                                    "2-digit"
                                            }
                                        )
                                        : "En curso"
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Tiempo trabajado
                            </span>

                            <strong>
                                ${calcularHorasTrabajadas(
                                    jornada
                                )}
                            </strong>

                        </div>

                    </div>

                </section>


            </main>


            <nav class="navegacion-movil">

                <button
                    class="activo"
                    type="button"
                    onclick="regresarDashboard()">

                    <span>
                        ⌂
                    </span>

                    Inicio

                </button>


                <button
                    type="button"
                    onclick="mostrarPersonal()">

                    <span>
                        👥
                    </span>

                    Personal

                </button>


                <button
                    type="button"
                    onclick="mostrarInventario()">

                    <span>
                        📦
                    </span>

                    Inventario

                </button>


                <button
                    type="button">

                    <span>
                        ⋯
                    </span>

                    Más

                </button>

            </nav>

        </div>

    `;
}
/* =========================================================
   REGRESAR AL DASHBOARD
   ========================================================= */

function regresarDashboard() {

    const jornada =
        obtenerJornadaActual();

    if (!jornada) {
        mostrarPantallaJornada();
        return;
    }

    mostrarDashboard(jornada);
}


/* =========================================================
   PERSONAL
   ========================================================= */

function obtenerEmpleados() {

    const datos =
        localStorage.getItem(
            CLAVE_EMPLEADOS
        );

    if (!datos) {
        return [];
    }

    try {

        return JSON.parse(datos);

    } catch (error) {

        console.error(
            "Error al leer empleados:",
            error
        );

        return [];
    }
}


function guardarEmpleados(
    empleados
) {

    localStorage.setItem(
        CLAVE_EMPLEADOS,
        JSON.stringify(
            empleados
        )
    );
}


function mostrarPersonal() {

    const app =
        document.getElementById("app");

    const empleados =
        obtenerEmpleados();

    app.innerHTML = `

        <div class="sistema">

            <header class="topbar">

                <div class="marca">

                    <button
                        class="texto-boton"
                        type="button"
                        onclick="regresarDashboard()">

                        ← Inicio

                    </button>

                    <div class="marca-icono">
                        CR
                    </div>

                    <div>

                        <strong>
                            Personal
                        </strong>

                        <small>
                            Administración
                        </small>

                    </div>

                </div>


                <button
                    class="usuario-boton"
                    type="button">

                    <span class="usuario-avatar">
                        ${obtenerIniciales(
                            USUARIO_ACTUAL.nombre
                        )}
                    </span>

                    <span class="usuario-info">

                        <strong>
                            ${USUARIO_ACTUAL.nombre}
                        </strong>

                        <small>
                            ${USUARIO_ACTUAL.rol}
                        </small>

                    </span>

                </button>

            </header>


            <main class="contenido">


                <section class="bienvenida">

                    <div>

                        <div class="etiqueta">
                            PERSONAL
                        </div>

                        <h1>
                            Personal del restaurante
                        </h1>

                        <p>
                            Administración de empleados
                            y colaboradores.
                        </p>

                    </div>


                    <button
                        class="btn-agregar-personal"
                        type="button"
                        onclick="mostrarFormularioEmpleado()">

                        + Agregar empleado

                    </button>

                </section>


                <section class="indicadores">


                    <article class="indicador">

                        <div class="indicador-icono">
                            👥
                        </div>

                        <div>

                            <span>
                                PERSONAL
                            </span>

                            <strong>
                                ${empleados.length}
                            </strong>

                            <small>
                                Registrados
                            </small>

                        </div>

                    </article>


                    <article class="indicador">

                        <div class="indicador-icono">
                            ✓
                        </div>

                        <div>

                            <span>
                                ACTIVOS
                            </span>

                            <strong>
                                ${
                                    empleados.filter(
                                        empleado =>
                                            empleado.estado ===
                                            "Activo"
                                    ).length
                                }
                            </strong>

                            <small>
                                Actualmente
                            </small>

                        </div>

                    </article>


                </section>


                <section class="panel panel-personal">

                    <div class="panel-cabecera">

                        <div>

                            <span>
                                EQUIPO
                            </span>

                            <h2>
                                Empleados
                            </h2>

                        </div>

                        <span class="contador-alertas">
                            ${empleados.length}
                        </span>

                    </div>


                    <div id="lista-empleados">

                        ${renderizarEmpleados(
                            empleados
                        )}

                    </div>

                </section>


            </main>


            <nav class="navegacion-movil">

                <button
                    type="button"
                    onclick="regresarDashboard()">

                    <span>
                        ⌂
                    </span>

                    Inicio

                </button>


                <button
                    class="activo"
                    type="button"
                    onclick="mostrarPersonal()">

                    <span>
                        👥
                    </span>

                    Personal

                </button>


                <button
                    type="button"
                    onclick="mostrarInventario()">

                    <span>
                        📦
                    </span>

                    Inventario

                </button>


                <button
                    type="button">

                    <span>
                        ⋯
                    </span>

                    Más

                </button>

            </nav>

        </div>

    `;
}


/* =========================================================
   RENDERIZAR EMPLEADOS
   ========================================================= */

function renderizarEmpleados(
    empleados
) {

    if (!empleados.length) {

        return `

            <div class="personal-vacio">

                <div>
                    👥
                </div>

                <h3>
                    Aún no hay empleados registrados
                </h3>

                <p>
                    Agrega el primer empleado
                    para comenzar a administrar
                    el personal.
                </p>

                <button
                    class="btn-principal"
                    type="button"
                    onclick="mostrarFormularioEmpleado()">

                    + Agregar empleado

                </button>

            </div>

        `;
    }


    return empleados.map(
        empleado => {

            return `

                <article class="empleado-item">

                    <div class="empleado-avatar">
                        ${obtenerIniciales(
                            empleado.nombre
                        )}
                    </div>


                    <div class="empleado-info">

                        <strong>
                            ${empleado.nombre}
                        </strong>

                        <span>
                            ${
                                empleado.puesto ||
                                "Sin puesto"
                            }
                        </span>

                        <small>
                            ${
                                empleado.telefono ||
                                "Sin teléfono"
                            }
                        </small>

                    </div>


                    <div class="empleado-estado">

                        <span class="estado-activo">
                            ${
                                empleado.estado ||
                                "Activo"
                            }
                        </span>

                    </div>


                    <div
                        style="
                            display:flex;
                            gap:8px;
                            align-items:center;
                        "
                    >

                        <button
                            type="button"
                            title="Editar empleado"
                            onclick="mostrarFormularioEmpleado(${empleado.id})"
                            style="
                                width:38px;
                                height:38px;
                                border-radius:10px;
                                border:1px solid rgba(200,164,93,.45);
                                background:#123d67;
                                color:#ffffff;
                                font-size:17px;
                                cursor:pointer;
                            "
                        >
                            ✏️
                        </button>


                        <button
                            class="empleado-eliminar"
                            type="button"
                            title="Eliminar empleado"
                            onclick="eliminarEmpleado(${empleado.id})"
                        >
                            ×
                        </button>

                    </div>

                </article>

            `;
        }
    ).join("");
}


/* =========================================================
   FORMULARIO EMPLEADO
   ========================================================= */

function mostrarFormularioEmpleado(
    id = null
) {

    const app =
        document.getElementById("app");

    const empleados =
        obtenerEmpleados();

    const empleado =
        id !== null
            ? empleados.find(
                item =>
                    item.id === id
            )
            : null;

    const editando =
        Boolean(empleado);


    app.innerHTML = `

        <div class="sistema">

            <header class="topbar">

                <div class="marca">

                    <button
                        class="texto-boton"
                        type="button"
                        onclick="mostrarPersonal()">

                        ← Regresar

                    </button>

                    <div class="marca-icono">
                        CR
                    </div>

                    <div>

                        <strong>
                            ${
                                editando
                                    ? "Editar empleado"
                                    : "Nuevo empleado"
                            }
                        </strong>

                        <small>
                            Personal
                        </small>

                    </div>

                </div>

            </header>


            <main class="contenido">


                <section class="bienvenida">

                    <div>

                        <div class="etiqueta">
                            PERSONAL
                        </div>

                        <h1>
                            ${
                                editando
                                    ? "Editar empleado"
                                    : "Registrar empleado"
                            }
                        </h1>

                        <p>
                            Captura los datos
                            principales del personal.
                        </p>

                    </div>

                </section>


                <section class="panel">

                    <form
                        class="formulario-personal"
                        onsubmit="guardarEmpleado(event, ${
                            editando
                                ? empleado.id
                                : "null"
                        })">


                        <div class="formulario-grid">


                            <div class="campo">

                                <label>
                                    Nombre completo
                                </label>

                                <input
                                    type="text"
                                    id="nombreEmpleado"
                                    required
                                    value="${
                                        empleado?.nombre ||
                                        ""
                                    }"
                                    placeholder="Ej. Juan Pérez">

                            </div>


                            <div class="campo">

                                <label>
                                    Puesto
                                </label>

                                <input
                                    type="text"
                                    id="puestoEmpleado"
                                    value="${
                                        empleado?.puesto ||
                                        ""
                                    }"
                                    placeholder="Ej. Mesero">

                            </div>


                            <div class="campo">

                                <label>
                                    Teléfono
                                </label>

                                <input
                                    type="tel"
                                    id="telefonoEmpleado"
                                    value="${
                                        empleado?.telefono ||
                                        ""
                                    }"
                                    placeholder="Ej. 322 000 0000">

                            </div>


                            <div class="campo">

                                <label>
                                    Estado
                                </label>

                                <select
                                    id="estadoEmpleado">

                                    <option
                                        value="Activo"
                                        ${
                                            (
                                                empleado?.estado ||
                                                "Activo"
                                            ) ===
                                            "Activo"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Activo
                                    </option>

                                    <option
                                        value="Inactivo"
                                        ${
                                            empleado?.estado ===
                                            "Inactivo"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Inactivo
                                    </option>

                                </select>

                            </div>


                            <div class="campo">

                                <label>
                                    Fecha de ingreso
                                </label>

                                <input
                                    type="date"
                                    id="fechaIngresoEmpleado"
                                    value="${
                                        empleado?.fechaIngreso ||
                                        obtenerFechaActual()
                                    }">

                            </div>


                            <div class="campo">

                                <label>
                                    Tipo de jornada
                                </label>

                                <select
                                    id="tipoJornadaEmpleado">

                                    <option
                                        value="Tiempo completo"
                                        ${
                                            (
                                                empleado?.tipoJornada ||
                                                "Tiempo completo"
                                            ) ===
                                            "Tiempo completo"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Tiempo completo
                                    </option>

                                    <option
                                        value="Medio tiempo"
                                        ${
                                            empleado?.tipoJornada ===
                                            "Medio tiempo"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Medio tiempo
                                    </option>

                                    <option
                                        value="Fines de semana"
                                        ${
                                            empleado?.tipoJornada ===
                                            "Fines de semana"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Fines de semana
                                    </option>

                                    <option
                                        value="Temporal"
                                        ${
                                            empleado?.tipoJornada ===
                                            "Temporal"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Temporal
                                    </option>

                                </select>

                            </div>

                        </div>


                        <div class="formulario-acciones">

                            <button
                                class="btn-secundario"
                                type="button"
                                onclick="mostrarPersonal()">

                                Cancelar

                            </button>


                            <button
                                class="btn-principal"
                                type="submit">

                                ${
                                    editando
                                        ? "Guardar cambios"
                                        : "Guardar empleado"
                                }

                            </button>

                        </div>

                    </form>

                </section>


            </main>

        </div>

    `;
}


/* =========================================================
   GUARDAR EMPLEADO
   ========================================================= */

function guardarEmpleado(
    event,
    id = null
) {

    event.preventDefault();

    const empleados =
        obtenerEmpleados();

    const nombre =
        document
            .getElementById(
                "nombreEmpleado"
            )
            .value
            .trim();

    const puesto =
        document
            .getElementById(
                "puestoEmpleado"
            )
            .value
            .trim();

    const telefono =
        document
            .getElementById(
                "telefonoEmpleado"
            )
            .value
            .trim();

    const estado =
        document
            .getElementById(
                "estadoEmpleado"
            )
            .value;

    const fechaIngreso =
        document
            .getElementById(
                "fechaIngresoEmpleado"
            )
            .value;

    const tipoJornada =
        document
            .getElementById(
                "tipoJornadaEmpleado"
            )
            .value;


    if (!nombre) {

        alert(
            "Escribe el nombre del empleado."
        );

        return;
    }


    if (id !== null) {

        const empleado =
            empleados.find(
                item =>
                    item.id === id
            );

        if (empleado) {

            empleado.nombre =
                nombre;

            empleado.puesto =
                puesto;

            empleado.telefono =
                telefono;

            empleado.estado =
                estado;

            empleado.fechaIngreso =
                fechaIngreso;

            empleado.tipoJornada =
                tipoJornada;

            empleado.fechaModificacion =
                new Date().toISOString();
        }

    } else {

        empleados.push({

            id: Date.now(),

            nombre,

            puesto,

            telefono,

            estado,

            fechaIngreso,

            tipoJornada,

            fechaRegistro:
                new Date().toISOString()

        });
    }


    guardarEmpleados(
        empleados
    );

    mostrarPersonal();
}


/* =========================================================
   ELIMINAR EMPLEADO
   ========================================================= */

function eliminarEmpleado(
    id
) {

    const empleados =
        obtenerEmpleados();

    const empleado =
        empleados.find(
            item =>
                item.id === id
        );

    if (!empleado) {
        return;
    }


    const confirmar =
        confirm(
            `¿Deseas eliminar a ${empleado.nombre}?`
        );

    if (!confirmar) {
        return;
    }


    const restantes =
        empleados.filter(
            item =>
                item.id !== id
        );


    guardarEmpleados(
        restantes
    );

    mostrarPersonal();
}


/* =========================================================
   INVENTARIO
   ========================================================= */

function obtenerInventario() {

    const datos =
        localStorage.getItem(
            CLAVE_INVENTARIO
        );

    if (!datos) {
        return [];
    }

    try {

        return JSON.parse(datos);

    } catch (error) {

        console.error(
            "Error al leer inventario:",
            error
        );

        return [];
    }
}


function guardarInventario(
    productos
) {

    localStorage.setItem(
        CLAVE_INVENTARIO,
        JSON.stringify(
            productos
        )
    );
}


function obtenerProductosBajoMinimo(
    productos
) {

    return productos.filter(
        producto =>
            Number(
                producto.existencia
            ) <=
            Number(
                producto.stockMinimo
            )
    );
}


/* =========================================================
   MOSTRAR INVENTARIO
   ========================================================= */

function mostrarInventario() {

    const app =
        document.getElementById("app");

    const productos =
        obtenerInventario();

    const productosBajoMinimo =
        obtenerProductosBajoMinimo(
            productos
        );


    app.innerHTML = `

        <div class="sistema">

            <header class="topbar">

                <div class="marca">

                    <button
                        class="texto-boton"
                        type="button"
                        onclick="regresarDashboard()">

                        ← Inicio

                    </button>

                    <div class="marca-icono">
                        CR
                    </div>

                    <div>

                        <strong>
                            Inventario
                        </strong>

                        <small>
                            Administración
                        </small>

                    </div>

                </div>


                <button
                    class="usuario-boton"
                    type="button">

                    <span class="usuario-avatar">
                        ${obtenerIniciales(
                            USUARIO_ACTUAL.nombre
                        )}
                    </span>

                    <span class="usuario-info">

                        <strong>
                            ${USUARIO_ACTUAL.nombre}
                        </strong>

                        <small>
                            ${USUARIO_ACTUAL.rol}
                        </small>

                    </span>

                </button>

            </header>


            <main class="contenido">


                <section class="bienvenida">

                    <div>

                        <div class="etiqueta">
                            INVENTARIO
                        </div>

                        <h1>
                            Control de inventario
                        </h1>

                        <p>
                            Productos, existencias
                            y niveles mínimos.
                        </p>

                    </div>


                    <button
                        class="btn-agregar-personal"
                        type="button"
                        onclick="mostrarFormularioProducto()">

                        + Agregar producto

                    </button>

                </section>


              <section class="indicadores">

    <article
        class="indicador"
        role="button"
        tabindex="0"
        onclick="mostrarTablaExistencias()"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click();}"
        style="cursor:pointer;"
    >

        <div class="indicador-icono">
            📦
        </div>

        <div>

            <span>
                PRODUCTOS
            </span>

            <strong>
                ${productos.length}
            </strong>

            <small>
                Registrados
            </small>

        </div>

    </article>


    <article class="indicador">

        <div class="indicador-icono">
            ⚠️
        </div>

        <div>

            <span>
                STOCK BAJO
            </span>

            <strong>
                ${productosBajoMinimo.length}
            </strong>

            <small>
                Requieren atención
            </small>

        </div>

    </article>

</section>

                <section class="panel">

                    <div class="buscador-inventario">

                        <input
                            type="search"
                            placeholder="Buscar producto, código o categoría..."
                            oninput="filtrarInventario(this.value)">

                    </div>

                </section>


                <section class="panel panel-personal">

                    <div class="panel-cabecera">

                        <div>

                            <span>
                                EXISTENCIAS
                            </span>

                            <h2>
                                Productos
                            </h2>

                        </div>

                        <span class="contador-alertas">
                            ${productos.length}
                        </span>

                    </div>


                    <div id="lista-inventario">

                        ${renderizarInventario(
                            productos
                        )}

                    </div>

                </section>


            </main>


            <nav class="navegacion-movil">

                <button
                    type="button"
                    onclick="regresarDashboard()">

                    <span>
                        ⌂
                    </span>

                    Inicio

                </button>


                <button
                    type="button"
                    onclick="mostrarPersonal()">

                    <span>
                        👥
                    </span>

                    Personal

                </button>


                <button
                    class="activo"
                    type="button"
                    onclick="mostrarInventario()">

                    <span>
                        📦
                    </span>

                    Inventario

                </button>


                <button
                    type="button">

                    <span>
                        ⋯
                    </span>

                    Más

                </button>

            </nav>

        </div>

    `;
}

/* =========================================================
   TABLA GENERAL DE EXISTENCIAS
   ========================================================= */

function mostrarTablaExistencias(){

    const app = document.getElementById("app");

    const productos = obtenerInventario();

    const movimientos = obtenerMovimientosInventario();

    const filas = productos.map(producto => {

        const actual = Number(producto.existencia || 0);

        const salidasVenta = movimientos
            .filter(m =>
                String(m.productoId) === String(producto.id) &&
                m.tipo === "Salida" &&
                String(m.motivo || "").includes("venta")
            )
            .reduce(
                (total, m) => total + Number(m.cantidad || 0),
                0
            );

        const antesDeVentas = actual + salidasVenta;

        const unidad = producto.unidad || "";

        return `
            <tr>
                <td>${producto.nombre}</td>
                <td>${antesDeVentas.toFixed(3)} ${unidad}</td>
                <td>${salidasVenta.toFixed(3)} ${unidad}</td>
                <td>
                    <strong>${actual.toFixed(3)} ${unidad}</strong>
                </td>
            </tr>
        `;

    }).join("");

    app.innerHTML = `

        <div class="sistema">

            <header class="topbar">

                <div class="marca">

                    <button
                        class="texto-boton"
                        type="button"
                        onclick="mostrarInventario()"
                    >
                        ← Inventario
                    </button>

                    <div class="marca-icono">CR</div>

                    <div>
                        <strong>Existencias</strong>
                        <small>Administración</small>
                    </div>

                </div>

            </header>

            <main class="contenido">

                <section class="bienvenida">

                    <div>
                        <div class="etiqueta">INVENTARIO</div>

                        <h1>Existencias de productos</h1>

                        <p>
                            Consulta el consumo por ventas
                            y las cantidades disponibles.
                        </p>
                    </div>

                </section>

                <section class="panel">

                    <div style="overflow-x:auto;">

                        <table style="
                            width:100%;
                            border-collapse:collapse;
                            text-align:left;
                            min-width:560px;
                        ">

                            <thead>
                                <tr>
                                    <th style="padding:12px;">Producto</th>
                                    <th style="padding:12px;">Antes de ventas</th>
                                    <th style="padding:12px;">Utilizado</th>
                                    <th style="padding:12px;">Disponible</th>
                                </tr>
                            </thead>

                            <tbody>
                                ${filas || `
                                    <tr>
                                        <td colspan="4" style="padding:15px;">
                                            No hay productos registrados.
                                        </td>
                                    </tr>
                                `}
                            </tbody>

                        </table>

                    </div>

                </section>

            </main>

        </div>
    `;

}


/* =========================================================
   RENDERIZAR INVENTARIO
   ========================================================= */

function renderizarInventario(productos) {

    if (!productos.length) {

        return `
            <div class="personal-vacio">

                <div>📦</div>

                <h3>Aún no hay productos registrados</h3>

                <p>
                    Agrega el primer producto
                    para comenzar a controlar
                    el inventario.
                </p>

                <button
                    class="btn-principal"
                    type="button"
                    onclick="mostrarFormularioProducto()"
                >
                    + Agregar producto
                </button>

            </div>
        `;
    }

    return productos.map(producto => {

        const existencia = Number(producto.existencia || 0);
        const stockMinimo = Number(producto.stockMinimo || 0);
        const costo = Number(producto.costo || 0);

        const valorTotal = existencia * costo;

        const stockBajo = existencia <= stockMinimo;

        return `

            <article
                class="empleado-item"
                style="${
                    stockBajo
                    ? "border-color:rgba(239,68,68,.65);"
                    : ""
                }"
            >

                <div class="empleado-avatar">
                    📦
                </div>

                <div class="empleado-info">

                    <strong>
                        ${producto.nombre}
                    </strong>

                    <span>
                        ${producto.categoria}
                        ·
                        ${producto.unidad}
                    </span>

                    <small>
                        Código: ${producto.codigo}
                    </small>

                    <small>
                        Costo unitario:
                        $${costo.toFixed(2)}
                    </small>

                    <small>
                        Valor en inventario:
                        $${valorTotal.toFixed(2)}
                    </small>

                    <small>
                        Stock mínimo:
                        ${stockMinimo} ${producto.unidad}
                    </small>

                </div>

                <div class="empleado-estado">

                    <span
                        class="estado-activo"
                        style="${
                            stockBajo
                            ? "background:rgba(239,68,68,.15);color:#ff8b8b;border-color:rgba(239,68,68,.4);"
                            : ""
                        }"
                    >

                        ${existencia.toFixed(3)}
                        ${producto.unidad}

                    </span>

                    ${
                        stockBajo
                        ? `
                            <small style="color:#ff8b8b;">
                                ⚠️ Stock bajo
                            </small>
                        `
                        : ""
                    }

                </div>

                <div
                    style="
                        display:flex;
                        gap:8px;
                        align-items:center;
                    "
                >

                    <button
                        type="button"
                        title="Movimientos"
                        onclick="mostrarMovimientosProducto(${producto.id})"
                        style="
                            width:38px;
                            height:38px;
                            border-radius:10px;
                            border:1px solid rgba(200,164,93,.45);
                            background:#164d3a;
                            color:#ffffff;
                            font-size:17px;
                            cursor:pointer;
                        "
                    >
                        ↕️
                    </button>

                    <button
                        type="button"
                        title="Editar producto"
                        onclick="editarProducto(${producto.id})"
                        style="
                            width:38px;
                            height:38px;
                            border-radius:10px;
                            border:1px solid rgba(200,164,93,.45);
                            background:#123d67;
                            color:#ffffff;
                            font-size:17px;
                            cursor:pointer;
                        "
                    >
                        ✏️
                    </button>

                    <button
                        class="empleado-eliminar"
                        type="button"
                        title="Eliminar producto"
                        onclick="eliminarProducto(${producto.id})"
                    >
                        ×
                    </button>

                </div>

            </article>

        `;

    }).join("");

}

/* =========================================================
   FILTRAR INVENTARIO
   ========================================================= */

function filtrarInventario(
    texto
) {

    const productos =
        obtenerInventario();


    const busqueda =
        texto
            .trim()
            .toLowerCase();


    const filtrados =
        productos.filter(
            producto =>
                String(
                    producto.nombre
                )
                    .toLowerCase()
                    .includes(busqueda) ||

                String(
                    producto.codigo
                )
                    .toLowerCase()
                    .includes(busqueda) ||

                String(
                    producto.categoria
                )
                    .toLowerCase()
                    .includes(busqueda)
        );


    const lista =
        document.getElementById(
            "lista-inventario"
        );


    if (lista) {

        lista.innerHTML =
            renderizarInventario(
                filtrados
            );
    }
}


/* =========================================================
   FORMULARIO PRODUCTO
   ========================================================= */

function mostrarFormularioProducto() {

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <div class="sistema">

            <header class="topbar">

                <div class="marca">

                    <button
                        class="texto-boton"
                        type="button"
                        onclick="mostrarInventario()">

                        ← Regresar

                    </button>

                    <div class="marca-icono">
                        CR
                    </div>

                    <div>

                        <strong>
                            Nuevo producto
                        </strong>

                        <small>
                            Inventario
                        </small>

                    </div>

                </div>

            </header>


            <main class="contenido">


                <section class="bienvenida">

                    <div>

                        <div class="etiqueta">
                            INVENTARIO
                        </div>

                        <h1>
                            Registrar producto
                        </h1>

                        <p>
                            Captura los datos básicos
                            del producto.
                        </p>

                    </div>

                </section>


                <section class="panel">

                    <form
                        class="formulario-personal"
                        onsubmit="guardarProducto(event)">


                        <div class="formulario-grid">


                            <div class="campo">

                                <label>
                                    Código / SKU
                                </label>

                                <input
                                    type="text"
                                    id="codigoProducto"
                                    required
                                    placeholder="Ej. CAR-001">

                            </div>


                            <div class="campo">

                                <label>
                                    Nombre del producto
                                </label>

                                <input
                                    type="text"
                                    id="nombreProducto"
                                    required
                                    placeholder="Ej. Carne de res">

                            </div>


                            <div class="campo">

                                <label>
                                    Categoría
                                </label>

                                <input
                                    type="text"
                                    id="categoriaProducto"
                                    required
                                    placeholder="Ej. Carnes">

                            </div>


                            <div class="campo">

                                <label>
                                    Unidad de medida
                                </label>

                                <select
                                    id="unidadProducto"
                                    required>

                                    <option value="">
                                        Seleccionar
                                    </option>

                                    <option value="pieza">
                                        Pieza
                                    </option>

                                    <option value="kg">
                                        Kilogramo
                                    </option>

                                    <option value="g">
                                        Gramo
                                    </option>

                                    <option value="litro">
                                        Litro
                                    </option>

                                    <option value="ml">
                                        Mililitro
                                    </option>

                                    <option value="caja">
                                        Caja
                                    </option>

                                    <option value="paquete">
                                        Paquete
                                    </option>

                                </select>

                            </div>


                            <div class="campo">

                                <label>
                                    Existencia inicial
                                </label>

                                <input
                                    type="number"
                                    id="existenciaProducto"
                                    min="0"
                                    step="0.01"
                                    value="0"
                                    required>

                            </div>


                            <div class="campo">

                                <label>
                                    Stock mínimo
                                </label>

                                <input
                                    type="number"
                                    id="stockMinimoProducto"
                                    min="0"
                                    step="0.01"
                                    value="0"
                                    required>

                            </div>


                            <div class="campo">

                                <label>
                                    Costo
                                </label>

                                <input
                                    type="number"
                                    id="costoProducto"
                                    min="0"
                                    step="0.01"
                                    value="0"
                                    required>

                            </div>


                            <div class="campo">

                                <label>
                                    Precio de venta
                                </label>

                                <input
                                    type="number"
                                    id="precioProducto"
                                    min="0"
                                    step="0.01"
                                    value="0"
                                    required>

                            </div>

                        </div>


                        <div class="formulario-acciones">

                            <button
                                class="btn-secundario"
                                type="button"
                                onclick="mostrarInventario()">

                                Cancelar

                            </button>


                            <button
                                class="btn-principal"
                                type="submit">

                                Guardar producto

                            </button>

                        </div>

                    </form>

                </section>


            </main>

        </div>

    `;
}


/* =========================================================
   GUARDAR PRODUCTO
   ========================================================= */

function guardarProducto(
    event
) {

    event.preventDefault();


    const productos =
        obtenerInventario();


    const codigo =
        document
            .getElementById(
                "codigoProducto"
            )
            .value
            .trim();

    const nombre =
        document
            .getElementById(
                "nombreProducto"
            )
            .value
            .trim();

    const categoria =
        document
            .getElementById(
                "categoriaProducto"
            )
            .value
            .trim();

    const unidad =
        document
            .getElementById(
                "unidadProducto"
            )
            .value;

    const existencia =
        Number(
            document
                .getElementById(
                    "existenciaProducto"
                )
                .value
        );

    const stockMinimo =
        Number(
            document
                .getElementById(
                    "stockMinimoProducto"
                )
                .value
        );

    const costo =
        Number(
            document
                .getElementById(
                    "costoProducto"
                )
                .value
        );

    const precio =
        Number(
            document
                .getElementById(
                    "precioProducto"
                )
                .value
        );


    if (!codigo || !nombre || !categoria || !unidad) {

        alert(
            "Completa todos los campos obligatorios."
        );

        return;
    }


    const codigoExiste =
        productos.some(
            producto =>
                String(
                    producto.codigo
                ).toLowerCase() ===
                codigo.toLowerCase()
        );


    if (codigoExiste) {

        alert(
            "Ya existe un producto con ese código."
        );

        return;
    }


    const nuevoProducto = {

        id: Date.now(),

        codigo,

        nombre,

        categoria,

        unidad,

        existencia:
            Number.isFinite(
                existencia
            )
                ? existencia
                : 0,

        stockMinimo:
            Number.isFinite(
                stockMinimo
            )
                ? stockMinimo
                : 0,

        costo:
            Number.isFinite(
                costo
            )
                ? costo
                : 0,

        precio:
            Number.isFinite(
                precio
            )
                ? precio
                : 0,

        estado:
            "Activo",

        fechaRegistro:
            new Date().toISOString()

    };


    productos.push(
        nuevoProducto
    );


    guardarInventario(
        productos
    );


    mostrarInventario();
}


/* =========================================================
   EDITAR PRODUCTO
   ========================================================= */

function editarProducto(
    id
) {

    const productos =
        obtenerInventario();


    const producto =
        productos.find(
            item =>
                item.id === id
        );


    if (!producto) {
        return;
    }


    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <div class="sistema">

            <header class="topbar">

                <div class="marca">

                    <button
                        class="texto-boton"
                        type="button"
                        onclick="mostrarInventario()">

                        ← Regresar

                    </button>


                    <div class="marca-icono">
                        CR
                    </div>


                    <div>

                        <strong>
                            Editar producto
                        </strong>

                        <small>
                            Inventario
                        </small>

                    </div>

                </div>

            </header>


            <main class="contenido">


                <section class="bienvenida">

                    <div>

                        <div class="etiqueta">
                            INVENTARIO
                        </div>

                        <h1>
                            Editar producto
                        </h1>

                        <p>
                            Modifica los datos
                            del producto.
                        </p>

                    </div>

                </section>


                <section class="panel">

                    <form
                        class="formulario-personal"
                        onsubmit="guardarEdicionProducto(event, ${producto.id})">


                        <div class="formulario-grid">


                            <div class="campo">

                                <label>
                                    Código / SKU
                                </label>

                                <input
                                    type="text"
                                    id="codigoProducto"
                                    required
                                    value="${producto.codigo || ""}">

                            </div>


                            <div class="campo">

                                <label>
                                    Nombre del producto
                                </label>

                                <input
                                    type="text"
                                    id="nombreProducto"
                                    required
                                    value="${producto.nombre || ""}">

                            </div>


                            <div class="campo">

                                <label>
                                    Categoría
                                </label>

                                <input
                                    type="text"
                                    id="categoriaProducto"
                                    required
                                    value="${producto.categoria || ""}">

                            </div>


                            <div class="campo">

                                <label>
                                    Unidad de medida
                                </label>

                                <select
                                    id="unidadProducto"
                                    required>

                                    <option value="pieza"
                                        ${
                                            producto.unidad === "pieza"
                                                ? "selected"
                                                : ""
                                        }>
                                        Pieza
                                    </option>

                                    <option value="kg"
                                        ${
                                            producto.unidad === "kg"
                                                ? "selected"
                                                : ""
                                        }>
                                        Kilogramo
                                    </option>

                                    <option value="g"
                                        ${
                                            producto.unidad === "g"
                                                ? "selected"
                                                : ""
                                        }>
                                        Gramo
                                    </option>

                                    <option value="litro"
                                        ${
                                            producto.unidad === "litro"
                                                ? "selected"
                                                : ""
                                        }>
                                        Litro
                                    </option>

                                    <option value="ml"
                                        ${
                                            producto.unidad === "ml"
                                                ? "selected"
                                                : ""
                                        }>
                                        Mililitro
                                    </option>

                                    <option value="caja"
                                        ${
                                            producto.unidad === "caja"
                                                ? "selected"
                                                : ""
                                        }>
                                        Caja
                                    </option>

                                    <option value="paquete"
                                        ${
                                            producto.unidad === "paquete"
                                                ? "selected"
                                                : ""
                                        }>
                                        Paquete
                                    </option>

                                </select>

                            </div>


                            <div class="campo">

                                <label>
                                    Existencia
                                </label>

                                <input
                                    type="number"
                                    id="existenciaProducto"
                                    min="0"
                                    step="0.01"
                                    required
                                    value="${producto.existencia ?? 0}">

                            </div>


                            <div class="campo">

                                <label>
                                    Stock mínimo
                                </label>

                                <input
                                    type="number"
                                    id="stockMinimoProducto"
                                    min="0"
                                    step="0.01"
                                    required
                                    value="${producto.stockMinimo ?? 0}">

                            </div>


                            <div class="campo">

                                <label>
                                    Costo
                                </label>

                                <input
                                    type="number"
                                    id="costoProducto"
                                    min="0"
                                    step="0.01"
                                    required
                                    value="${producto.costo ?? 0}">

                            </div>


                            <div class="campo">

                                <label>
                                    Precio de venta
                                </label>

                                <input
                                    type="number"
                                    id="precioProducto"
                                    min="0"
                                    step="0.01"
                                    required
                                    value="${producto.precio ?? 0}">

                            </div>

                        </div>


                        <div class="formulario-acciones">

                            <button
                                class="btn-secundario"
                                type="button"
                                onclick="mostrarInventario()">

                                Cancelar

                            </button>


                            <button
                                class="btn-principal"
                                type="submit">

                                Guardar cambios

                            </button>

                        </div>

                    </form>

                </section>


            </main>

        </div>

    `;
}


/* =========================================================
   GUARDAR EDICIÓN DE PRODUCTO
   ========================================================= */

function guardarEdicionProducto(
    event,
    id
) {

    event.preventDefault();


    const productos =
        obtenerInventario();


    const producto =
        productos.find(
            item =>
                item.id === id
        );


    if (!producto) {

        alert(
            "No se encontró el producto."
        );

        return;
    }


    const codigo =
        document
            .getElementById(
                "codigoProducto"
            )
            .value
            .trim();

    const nombre =
        document
            .getElementById(
                "nombreProducto"
            )
            .value
            .trim();

    const categoria =
        document
            .getElementById(
                "categoriaProducto"
            )
            .value
            .trim();

    const unidad =
        document
            .getElementById(
                "unidadProducto"
            )
            .value;

    const existencia =
        Number(
            document
                .getElementById(
                    "existenciaProducto"
                )
                .value
        );

    const stockMinimo =
        Number(
            document
                .getElementById(
                    "stockMinimoProducto"
                )
                .value
        );

    const costo =
        Number(
            document
                .getElementById(
                    "costoProducto"
                )
                .value
        );

    const precio =
        Number(
            document
                .getElementById(
                    "precioProducto"
                )
                .value
        );


    if (!codigo || !nombre || !categoria || !unidad) {

        alert(
            "Completa todos los campos obligatorios."
        );

        return;
    }


    const codigoDuplicado =
        productos.some(
            item =>
                item.id !== id &&
                String(
                    item.codigo
                ).toLowerCase() ===
                codigo.toLowerCase()
        );


    if (codigoDuplicado) {

        alert(
            "Ya existe otro producto con ese código."
        );

        return;
    }


    producto.codigo =
        codigo;

    producto.nombre =
        nombre;

    producto.categoria =
        categoria;

    producto.unidad =
        unidad;

    producto.existencia =
        Number.isFinite(
            existencia
        )
            ? existencia
            : 0;

    producto.stockMinimo =
        Number.isFinite(
            stockMinimo
        )
            ? stockMinimo
            : 0;

    producto.costo =
        Number.isFinite(
            costo
        )
            ? costo
            : 0;

    producto.precio =
        Number.isFinite(
            precio
        )
            ? precio
            : 0;

    producto.fechaModificacion =
        new Date().toISOString();


    guardarInventario(
        productos
    );


    mostrarInventario();
}


/* =========================================================
   ELIMINAR PRODUCTO
   ========================================================= */

function eliminarProducto(
    id
) {

    const productos =
        obtenerInventario();


    const producto =
        productos.find(
            item =>
                item.id === id
        );


    if (!producto) {
        return;
    }


    const confirmar =
        confirm(
            `¿Deseas eliminar el producto "${producto.nombre}"?`
        );


    if (!confirmar) {
        return;
    }


    const restantes =
        productos.filter(
            item =>
                item.id !== id
        );


    guardarInventario(
        restantes
    );


    mostrarInventario();
}


/* =========================================================
   MOVIMIENTOS DE INVENTARIO
   ========================================================= */

function obtenerMovimientosInventario() {

    const datos =
        localStorage.getItem(
            CLAVE_MOVIMIENTOS
        );


    if (!datos) {
        return [];
    }


    try {

        return JSON.parse(
            datos
        );

    } catch (error) {

        console.error(
            "Error al leer movimientos:",
            error
        );

        return [];
    }
}


function guardarMovimientosInventario(
    movimientos
) {

    localStorage.setItem(
        CLAVE_MOVIMIENTOS,
        JSON.stringify(
            movimientos
        )
    );
}


/* =========================================================
   MOSTRAR MOVIMIENTOS DE PRODUCTO
   ========================================================= */

function mostrarMovimientosProducto(
    id
) {

    const productos =
        obtenerInventario();


    const producto =
        productos.find(
            item =>
                item.id === id
        );


    if (!producto) {
        return;
    }


    const movimientos =
        obtenerMovimientosInventario()
            .filter(
                movimiento =>
                    movimiento.productoId === id
            )
            .sort(
                (a, b) =>
                    new Date(b.fecha) -
                    new Date(a.fecha)
            );


    const app =
        document.getElementById("app");


    app.innerHTML = `

        <div class="sistema">

            <header class="topbar">

                <div class="marca">

                    <button
                        class="texto-boton"
                        type="button"
                        onclick="mostrarInventario()">

                        ← Regresar

                    </button>


                    <div class="marca-icono">
                        CR
                    </div>


                    <div>

                        <strong>
                            Movimientos
                        </strong>

                        <small>
                            Inventario
                        </small>

                    </div>

                </div>


                <button
                    class="usuario-boton"
                    type="button">

                    <span class="usuario-avatar">
                        ${obtenerIniciales(
                            USUARIO_ACTUAL.nombre
                        )}
                    </span>

                    <span class="usuario-info">

                        <strong>
                            ${USUARIO_ACTUAL.nombre}
                        </strong>

                        <small>
                            ${USUARIO_ACTUAL.rol}
                        </small>

                    </span>

                </button>

            </header>


            <main class="contenido">


                <section class="bienvenida">

                    <div>

                        <div class="etiqueta">
                            INVENTARIO
                        </div>


                        <h1>
                            ${producto.nombre}
                        </h1>


                        <p>
                            Historial de movimientos
                            del producto.
                        </p>

                    </div>


                    <button
                        class="btn-agregar-personal"
                        type="button"
                        onclick="mostrarFormularioMovimiento(${producto.id})">

                        + Nuevo movimiento

                    </button>

                </section>


                <section class="indicadores">


                    <article class="indicador">

                        <div class="indicador-icono">
                            📦
                        </div>


                        <div>

                            <span>
                                EXISTENCIA
                            </span>


                            <strong>
                                ${producto.existencia}
                            </strong>


                            <small>
                                ${producto.unidad}
                            </small>

                        </div>

                    </article>


                    <article class="indicador">

                        <div class="indicador-icono">
                            ↕
                        </div>


                        <div>

                            <span>
                                MOVIMIENTOS
                            </span>


                            <strong>
                                ${movimientos.length}
                            </strong>


                            <small>
                                Registrados
                            </small>

                        </div>

                    </article>


                </section>


                <section class="panel panel-personal">


                    <div class="panel-cabecera">

                        <div>

                            <span>
                                HISTORIAL
                            </span>


                            <h2>
                                Movimientos
                            </h2>

                        </div>


                        <span class="contador-alertas">
                            ${movimientos.length}
                        </span>

                    </div>


                    <div>

                        ${
                            renderizarMovimientos(
                                movimientos,
                                producto.id
                            )
                        }

                    </div>


                </section>


            </main>


            <nav class="navegacion-movil">

                <button
                    type="button"
                    onclick="regresarDashboard()">

                    <span>
                        ⌂
                    </span>

                    Inicio

                </button>


                <button
                    type="button"
                    onclick="mostrarPersonal()">

                    <span>
                        👥
                    </span>

                    Personal

                </button>


                <button
                    class="activo"
                    type="button"
                    onclick="mostrarInventario()">

                    <span>
                        📦
                    </span>

                    Inventario

                </button>


                <button
                    type="button">

                    <span>
                        ⋯
                    </span>

                    Más

                </button>

            </nav>

        </div>

    `;
}


/* =========================================================
   RENDERIZAR MOVIMIENTOS
   ========================================================= */

function renderizarMovimientos(
    movimientos,
    productoId
) {

    if (!movimientos.length) {

        return `

            <div class="personal-vacio">

                <div>
                    ↕️
                </div>


                <h3>
                    Sin movimientos registrados
                </h3>


                <p>
                    Cuando registres una entrada,
                    salida, merma o ajuste,
                    aparecerá aquí.
                </p>


                <button
                    class="btn-principal"
                    type="button"
                    onclick="mostrarFormularioMovimiento(${productoId})">

                    + Registrar movimiento

                </button>

            </div>

        `;
    }


    return movimientos.map(
        movimiento => {

            let color =
                "#82bcff";

            let signo =
                "";


            if (
                movimiento.tipo ===
                "Entrada"
            ) {

                color =
                    "#65d695";

                signo =
                    "+";

            }


            if (
                movimiento.tipo ===
                "Salida"
            ) {

                color =
                    "#ff8b8b";

                signo =
                    "-";

            }


            if (
                movimiento.tipo ===
                "Merma"
            ) {

                color =
                    "#ffb86b";

                signo =
                    "-";

            }


            if (
                movimiento.tipo ===
                "Ajuste"
            ) {

                color =
                    "#82bcff";

            }


            return `

                <article
                    class="empleado-item"
                    style="
                        border-color:
                        rgba(200,164,93,.22);
                    "
                >

                    <div
                        class="empleado-avatar"
                        style="
                            color:${color};
                        "
                    >

                        ${signo || "↕"}

                    </div>


                    <div class="empleado-info">

                        <strong>
                            ${movimiento.tipo}
                        </strong>


                        <span>

                            ${
                                movimiento.tipo ===
                                "Ajuste"

                                ? `Nueva existencia:
                                   ${movimiento.cantidad}
                                   ${movimiento.unidad}`

                                : `${signo}
                                   ${movimiento.cantidad}
                                   ${movimiento.unidad}`
                            }

                        </span>


                        <small>

                            ${formatearFechaHora(
                                movimiento.fecha
                            )}

                            ·

                            ${movimiento.usuario}

                        </small>


                        ${
                            movimiento.motivo
                                ? `
                                    <small>
                                        ${movimiento.motivo}
                                    </small>
                                `
                                : ""
                        }

                    </div>


                    <div class="empleado-estado">

                        <span
                            class="estado-activo"
                            style="
                                color:${color};
                                border-color:${color};
                                background:transparent;
                            "
                        >

                            ${
                                movimiento.existenciaAnterior
                            }

                            →

                            ${
                                movimiento.existenciaNueva
                            }

                        </span>

                    </div>

                </article>

            `;
        }
    ).join("");
}


/* =========================================================
   FORMULARIO MOVIMIENTO
   ========================================================= */

function mostrarFormularioMovimiento(
    productoId
) {

    const productos =
        obtenerInventario();


    const producto =
        productos.find(
            item =>
                item.id === productoId
        );


    if (!producto) {
        return;
    }


    const app =
        document.getElementById("app");


    app.innerHTML = `

        <div class="sistema">

            <header class="topbar">

                <div class="marca">

                    <button
                        class="texto-boton"
                        type="button"
                        onclick="mostrarMovimientosProducto(${producto.id})">

                        ← Regresar

                    </button>


                    <div class="marca-icono">
                        CR
                    </div>


                    <div>

                        <strong>
                            Nuevo movimiento
                        </strong>

                        <small>
                            Inventario
                        </small>

                    </div>

                </div>

            </header>


            <main class="contenido">


                <section class="bienvenida">

                    <div>

                        <div class="etiqueta">
                            INVENTARIO
                        </div>


                        <h1>
                            ${producto.nombre}
                        </h1>


                        <p>
                            Registrar movimiento
                            de inventario.
                        </p>

                    </div>

                </section>


                <section class="panel">

                    <form
                        class="formulario-personal"
                        onsubmit="guardarMovimiento(event, ${producto.id})">


                        <div class="formulario-grid">


                            <div class="campo">

                                <label>
                                    Tipo de movimiento
                                </label>

                                <select
                                    id="tipoMovimiento"
                                    required>

                                    <option value="">
                                        Seleccionar
                                    </option>

                                    <option value="Entrada">
                                        Entrada
                                    </option>

                                    <option value="Salida">
                                        Salida
                                    </option>

                                    <option value="Merma">
                                        Merma
                                    </option>

                                    <option value="Ajuste">
                                        Ajuste
                                    </option>

                                </select>

                            </div>


                            <div class="campo">

                                <label>
                                    Cantidad
                                </label>

                                <input
                                    type="number"
                                    id="cantidadMovimiento"
                                    min="0"
                                    step="0.01"
                                    required
                                    placeholder="Ej. 10">

                            </div>


                            <div class="campo">

                                <label>
                                    Motivo / referencia
                                </label>

                                <input
                                    type="text"
                                    id="motivoMovimiento"
                                    placeholder="Ej. Compra, venta, merma...">

                            </div>


                            <div class="campo">

                                <label>
                                    Existencia actual
                                </label>

                                <input
                                    type="text"
                                    value="${producto.existencia} ${producto.unidad}"
                                    disabled>

                            </div>

                        </div>


                        <div class="formulario-acciones">

                            <button
                                class="btn-secundario"
                                type="button"
                                onclick="mostrarMovimientosProducto(${producto.id})">

                                Cancelar

                            </button>


                            <button
                                class="btn-principal"
                                type="submit">

                                Registrar movimiento

                            </button>

                        </div>

                    </form>

                </section>


            </main>

        </div>

    `;
}


/* =========================================================
   GUARDAR MOVIMIENTO
   ========================================================= */

function guardarMovimiento(
    event,
    productoId
) {

    event.preventDefault();


    const productos =
        obtenerInventario();


    const producto =
        productos.find(
            item =>
                item.id === productoId
        );


    if (!producto) {

        alert(
            "No se encontró el producto."
        );

        return;
    }


    const tipo =
        document
            .getElementById(
                "tipoMovimiento"
            )
            .value;


    const cantidad =
        Number(
            document
                .getElementById(
                    "cantidadMovimiento"
                )
                .value
        );


    const motivo =
        document
            .getElementById(
                "motivoMovimiento"
            )
            .value
            .trim();


    if (!tipo) {

        alert(
            "Selecciona el tipo de movimiento."
        );

        return;
    }


    if (
        !Number.isFinite(cantidad) ||
        cantidad <= 0
    ) {

        alert(
            "La cantidad debe ser mayor que cero."
        );

        return;
    }


    const existenciaAnterior =
        Number(
            producto.existencia
        ) || 0;


    let existenciaNueva =
        existenciaAnterior;


    if (
        tipo ===
        "Entrada"
    ) {

        existenciaNueva +=
            cantidad;
    }


    if (
        tipo ===
        "Salida"
    ) {

        existenciaNueva -=
            cantidad;
    }


    if (
        tipo ===
        "Merma"
    ) {

        existenciaNueva -=
            cantidad;
    }


    if (
        tipo ===
        "Ajuste"
    ) {

        existenciaNueva =
            cantidad;
    }


    if (
        existenciaNueva < 0
    ) {

        alert(
            "No puedes registrar una salida o merma mayor a la existencia disponible."
        );

        return;
    }


    producto.existencia =
        Number(
            existenciaNueva.toFixed(2)
        );


    producto.fechaModificacion =
        new Date().toISOString();


    const movimientos =
        obtenerMovimientosInventario();


    movimientos.push({

        id: Date.now(),

        productoId:
            producto.id,

        productoNombre:
            producto.nombre,

        tipo,

        cantidad,

        unidad:
            producto.unidad,

        existenciaAnterior,

        existenciaNueva:
            producto.existencia,

        motivo,

        usuario:
            USUARIO_ACTUAL.nombre,

        fecha:
            new Date().toISOString()

    });


    guardarInventario(
        productos
    );


    guardarMovimientosInventario(
        movimientos
    );


    mostrarMovimientosProducto(
        producto.id
    );
}


/* =========================================================
   UTILIDADES
   ========================================================= */

function obtenerIniciales(
    nombre
) {

    if (!nombre) {
        return "CR";
    }


    const partes =
        nombre
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (partes.length === 1) {

        return partes[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        partes[0][0] +
        partes[1][0]
    ).toUpperCase();
}


function capitalizar(
    texto
) {

    if (!texto) {
        return "";
    }


    return texto.charAt(0)
        .toUpperCase() +
        texto.slice(1);
}


function formatearFechaHora(
    fecha
) {

    if (!fecha) {
        return "";
    }


    const fechaObj =
        new Date(fecha);


    return fechaObj.toLocaleString(
        "es-MX",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

/* =========================================================
   CONTROL RESTAURANTE
   MÓDULO DE VENTAS
   ========================================================= */

const CLAVE_VENTAS = "ventas_restaurante";

let carritoVenta = [];

const CLAVE_PRODUCTOS_VENTA = "productos_venta_restaurante";
const CLAVE_RECETAS = "recetas_restaurante";

function obtenerProductosVenta(){
    return JSON.parse(
        localStorage.getItem(CLAVE_PRODUCTOS_VENTA)
    ) || [];
}

function guardarProductosVenta(productos){
    localStorage.setItem(
        CLAVE_PRODUCTOS_VENTA,
        JSON.stringify(productos)
    );
}

function obtenerRecetas(){
    return JSON.parse(
        localStorage.getItem(CLAVE_RECETAS)
    ) || [];
}

function guardarRecetas(recetas){
    localStorage.setItem(
        CLAVE_RECETAS,
        JSON.stringify(recetas)
    );
}


/* =========================================================
   OBTENER VENTAS
   ========================================================= */

function obtenerVentas(){

    const ventas = localStorage.getItem(CLAVE_VENTAS);

    if(!ventas){
        return [];
    }

    try{

        return JSON.parse(ventas);

    }catch(error){

        console.error("Error leyendo ventas:", error);

        return [];

    }

}


/* =========================================================
   GUARDAR VENTAS
   ========================================================= */

function guardarVentas(ventas){

    localStorage.setItem(
        CLAVE_VENTAS,
        JSON.stringify(ventas)
    );

}


/* =========================================================
   GENERAR FOLIO
   ========================================================= */

function generarFolioVenta(){

    const ventas = obtenerVentas();

    const numero = ventas.length + 1;

    return "V-" + String(numero).padStart(5, "0");

}


/* =========================================================
   MOSTRAR VENTAS
   ========================================================= */

function mostrarVentas(){

    carritoVenta = [];

    const app = document.getElementById("app");

    if(!app){
        return;
    }

  const productosVenta = obtenerProductosVenta();

const productosActivos = productosVenta.filter(
    producto =>
        producto.estado !== "inactivo"
);

    app.innerHTML = `

        <div class="pantalla">

          <header class="topbar">

    <div>

        <h1>Ventas</h1>

        <p>
            Registrar venta
        </p>

    </div>

    <div style="
        display:flex;
        gap:10px;
        align-items:center;
        flex-wrap:wrap;
    ">

        <button
            type="button"
            onclick="mostrarCorteCaja()"
        >
            CORTE DE CAJA
        </button>

        <button
            type="button"
            onclick="mostrarDashboard(obtenerJornadaActual())"
        >
            ← Regresar
        </button>

    </div>

</header>


            <main class="contenido">


                <!-- =====================================
                     PRODUCTOS
                     ===================================== -->

                <section class="card">

                    <div class="card-header">

                        <div>

                            <h2>Productos</h2>

                            <p>
                                Selecciona los productos para agregar a la venta.
                            </p>

                        </div>

                    </div>


                    <div
                        id="listaProductosVenta"
                        class="grid-productos-venta"
                    >

                        ${
                            productosActivos.length === 0

                            ?

                            `
                            <div class="mensaje-vacio">

                              <h3>No hay productos de venta</h3>

<p>
    Agrega productos al menú de venta antes de realizar una venta.
</p>

                            </div>
                            `

                            :

                            productosActivos.map(producto => `

                                <button
                                    type="button"
                                    class="producto-venta"
                                    onclick="agregarProductoVenta('${producto.id}')"
                                >

                                    <div>

                                        <strong>
                                            ${producto.nombre}
                                        </strong>

                                        <small>
                                            ${producto.codigo || "Sin código"}
                                        </small>

                                    </div>


                                    <div>

                                        <strong>
                                            $${Number(producto.precio || 0).toFixed(2)}
                                        </strong>

                                        <small>
                                            Stock: ${producto.existencia} ${producto.unidad || ""}
                                        </small>

                                    </div>

                                </button>

                            `).join("")

                        }

                    </div>

                </section>



                <!-- =====================================
                     CARRITO
                     ===================================== -->

                <section class="card">

                    <div class="card-header">

                        <div>

                            <h2>Venta actual</h2>

                            <p>
                                Productos seleccionados
                            </p>

                        </div>

                        <strong id="folioVenta">
                            ${generarFolioVenta()}
                        </strong>

                    </div>


                    <div id="carritoVenta">

                        <div class="mensaje-vacio">

                            <h3>Venta vacía</h3>

                            <p>
                                Selecciona productos para comenzar.
                            </p>

                        </div>

                    </div>


                    <div id="resumenVenta">

                    </div>

                </section>


            </main>

        </div>

    `;

       renderizarCarritoVenta();

}

   function mostrarProductosVenta(){

    const app = document.getElementById("app");  

    if(!app){
        return;
    }

    const productos = obtenerProductosVenta();

    app.innerHTML = `

        <div class="pantalla">

            <header class="topbar">

                <div>

                    <h1>Productos de venta</h1>

                    <p>
                        Administra los productos que realmente se venden al cliente.
                    </p>

                </div>

                <button
                    type="button"
                    onclick="mostrarDashboard(obtenerJornadaActual())"
                >
                    ← Regresar
                </button>

            </header>


            <main class="contenido">

                <section class="card">

                    <div class="card-header">

                        <div>

                            <h2>Menú de venta</h2>

                            <p>
                                Estos productos aparecerán en el módulo de Ventas.
                            </p>

                        </div>

                        <button
                            type="button"
                            onclick="mostrarFormularioProductoVenta()"
                        >
                            + Nuevo producto
                        </button>
                        <button
    type="button"
    onclick="mostrarRecetas()"
>
    Recetas
</button>

                    </div>


                    <div class="tabla-contenedor">

                        ${
                            productos.length === 0

                            ?

                            `
                            <div class="mensaje-vacio">

                                <h3>No hay productos de venta</h3>

                                <p>
                                    Registra el primer producto del menú.
                                </p>

                            </div>
                            `

                            :

                            `
                            <table class="tabla">

                                <thead>

                                    <tr>
                                        <th>Código</th>
                                        <th>Producto</th>
                                        <th>Categoría</th>
                                        <th>Precio</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    ${
                                        productos.map(producto => `

                                            <tr>

                                                <td>
                                                    ${producto.codigo || "-"}
                                                </td>

                                                <td>
                                                    <strong>
                                                        ${producto.nombre}
                                                    </strong>
                                                </td>

                                                <td>
                                                    ${producto.categoria || "-"}
                                                </td>

                                                <td>
                                                    $${Number(producto.precio || 0).toFixed(2)}
                                                </td>

                                                <td>
                                                    ${producto.estado === "inactivo"
                                                        ? "Inactivo"
                                                        : "Activo"
                                                    }
                                                </td>

                                                <td>

                                                    <button
                                                        type="button"
                                                        onclick="editarProductoVenta('${producto.id}')"
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onclick="eliminarCatalogoProductoVenta('${producto.id}')"
                                                    >
                                                        Eliminar
                                                    </button>

                                                </td>

                                            </tr>

                                        `).join("")
                                    }

                                </tbody>

                            </table>
                            `
                        }

                    </div>

                </section>

            </main>

        </div>

    `;
}

/* =========================================================
   RECETAS DE PRODUCTOS DE VENTA
   ========================================================= */

function mostrarRecetas(){

    const app = document.getElementById("app");

    if(!app) return;

    const productos = obtenerProductosVenta();
    const recetas = obtenerRecetas();

    app.innerHTML = `

        <div class="pantalla">

            <header class="topbar">

                <div>
                    <h1>Recetas</h1>
                    <p>
                        Administración de ingredientes por platillo.
                    </p>
                </div>

                <button
                    type="button"
                    onclick="mostrarProductosVenta()"
                >
                    ← Regresar
                </button>

            </header>

            <main class="contenido">

                <section class="card">

                    <div class="card-header">

                        <div>
                            <h2>Recetas registradas</h2>
                            <p>
                                Selecciona un producto para administrar su receta.
                            </p>
                        </div>

                    </div>

                    <div>

                        ${
                            productos.length === 0

                            ? `<p>No hay productos de venta registrados.</p>`

                            : productos.map(producto => {

                                const receta = recetas.find(
                                    r => String(r.productoId) === String(producto.id)
                                );

                                return `

                                    <div class="card">

                                        <h3>${producto.nombre}</h3>

                                        <p>
                                            ${
                                                receta
                                                ? "Receta registrada"
                                                : "Sin receta"
                                            }
                                        </p>

                                        <button
                                            type="button"
                                            onclick="mostrarFormularioReceta('${producto.id}')"
                                        >
                                            ${
                                                receta
                                                ? "Editar receta"
                                                : "Crear receta"
                                            }
                                        </button>

                                    </div>

                                `;

                            }).join("")
                        }

                    </div>

                </section>

            </main>

        </div>

    `;

}

/* =========================================================
   FORMULARIO DE RECETAS
   ========================================================= */

function mostrarFormularioReceta(productoId){

    const app = document.getElementById("app");

    if(!app) return;

    const productos = obtenerProductosVenta();
    const inventario = obtenerInventario();
    const recetas = obtenerRecetas();

    const producto = productos.find(
        p => String(p.id) === String(productoId)
    );

    if(!producto){
        alert("Producto de venta no encontrado.");
        mostrarRecetas();
        return;
    }

    const receta = recetas.find(
        r => String(r.productoId) === String(productoId)
    );

    const ingredientes = receta && Array.isArray(receta.ingredientes)
        ? receta.ingredientes
        : [];

    app.innerHTML = `

        <div class="pantalla">

            <header class="topbar">

                <div>
                    <h1>Receta</h1>
                    <p>${producto.nombre}</p>
                </div>

                <button
                    type="button"
                    onclick="mostrarRecetas()"
                >
                    ← Regresar
                </button>

            </header>

            <main class="contenido">

                <section class="card">

                    <div class="card-header">

                        <div>
                            <h2>Ingredientes del platillo</h2>
                            <p>
                                Indica la cantidad utilizada
                                para preparar una porción.
                            </p>
                        </div>

                    </div>

                    <form
                        id="formularioReceta"
                        onsubmit="guardarFormularioReceta(event, '${producto.id}')"
                    >

                        ${
                            inventario.length === 0

                            ? `<p>
                                No hay ingredientes en Inventario.
                               </p>`

                            : inventario.map(item => {

                                const ingrediente = ingredientes.find(
                                    i => String(i.productoId) === String(item.id)
                                );

                                const cantidad = ingrediente
                                    ? ingrediente.cantidad
                                    : "";

                                return `

                                    <div class="campo">

                                        <label>
                                            ${item.nombre}
                                            (${item.unidad || "unidad"})
                                        </label>

                                        <input
                                            type="number"
                                            class="cantidad-ingrediente"
                                            data-producto-id="${item.id}"
                                            min="0"
                                            step="any"
                                            value="${cantidad}"
                                            placeholder="0"
                                        >

                                    </div>

                                `;

                            }).join("")
                        }

                        <button
                            type="submit"
                            ${inventario.length === 0 ? "disabled" : ""}
                        >
                            Guardar receta
                        </button>

                    </form>

                </section>

            </main>

        </div>

    `;

}


/* =========================================================
   GUARDAR RECETA
   ========================================================= */

function guardarFormularioReceta(event, productoId){

    event.preventDefault();

    const inventario = obtenerInventario();
    const recetas = obtenerRecetas();

    const campos = document.querySelectorAll(
        "#formularioReceta .cantidad-ingrediente"
    );

    const ingredientes = [];

    for(const campo of campos){

        const valor = campo.value.trim();

        if(valor === ""){
            continue;
        }

        const cantidad = Number(valor);

        if(!Number.isFinite(cantidad) || cantidad < 0){
            alert("Revisa las cantidades de los ingredientes.");
            return;
        }

        if(cantidad === 0){
            continue;
        }

        const item = inventario.find(
            p => String(p.id) === String(campo.dataset.productoId)
        );

        if(!item){
            alert("Uno de los ingredientes ya no existe.");
            return;
        }

        ingredientes.push({
            productoId: item.id,
            cantidad: cantidad
        });

    }

    if(ingredientes.length === 0){
        alert("Agrega al menos un ingrediente con cantidad mayor a cero.");
        return;
    }

    const indice = recetas.findIndex(
        r => String(r.productoId) === String(productoId)
    );

    const nuevaReceta = {
        productoId: productoId,
        ingredientes: ingredientes,
        fechaModificacion: new Date().toISOString()
    };

    if(indice >= 0){

        recetas[indice] = {
            ...recetas[indice],
            ...nuevaReceta
        };

    } else {

        recetas.push({
            id: Date.now().toString(),
            ...nuevaReceta,
            fechaRegistro: new Date().toISOString()
        });

    }

    guardarRecetas(recetas);

    alert("Receta guardada correctamente.");

    mostrarRecetas();

}

function mostrarFormularioProductoVenta(id = null){

    const productos = obtenerProductosVenta();

    const producto = id
        ? productos.find(p => String(p.id) === String(id))
        : null;

    const app = document.getElementById("app");

    if(!app){
        return;
    }

    app.innerHTML = `

        <div class="pantalla">

            <header class="topbar">

                <div>

                    <h1>
                        ${producto ? "Editar producto" : "Nuevo producto"}
                    </h1>

                    <p>
                        Producto que se ofrecerá al cliente.
                    </p>

                </div>

                <button
                    type="button"
                    onclick="mostrarProductosVenta()"
                >
                    ← Regresar
                </button>

            </header>


            <main class="contenido">

                <section class="card">

                    <form
                        onsubmit="guardarProductoVenta(event, ${id ? `'${id}'` : "null"})"
                    >

                        <div class="form-grid">

                            <div class="campo">

                                <label>
                                    Código / SKU
                                </label>

                                <input
                                    type="text"
                                    id="codigoProductoVenta"
                                    value="${producto?.codigo || ""}"
                                    placeholder="Ej. CV-001"
                                >

                            </div>


                            <div class="campo">

                                <label>
                                    Nombre del producto
                                </label>

                                <input
                                    type="text"
                                    id="nombreProductoVenta"
                                    value="${producto?.nombre || ""}"
                                    placeholder="Ej. Ceviche de camarón"
                                    required
                                >

                            </div>


                            <div class="campo">

                                <label>
                                    Categoría
                                </label>

                                <input
                                    type="text"
                                    id="categoriaProductoVenta"
                                    value="${producto?.categoria || ""}"
                                    placeholder="Ej. Mariscos"
                                >

                            </div>


                            <div class="campo">

                                <label>
                                    Precio de venta
                                </label>

                                <input
                                    type="number"
                                    id="precioProductoVenta"
                                    value="${producto?.precio ?? ""}"
                                    min="0"
                                    step="0.01"
                                    required
                                >

                            </div>


                            <div class="campo">

                                <label>
                                    Estado
                                </label>

                                <select id="estadoProductoVenta">

                                    <option
                                        value="activo"
                                        ${producto?.estado !== "inactivo" ? "selected" : ""}
                                    >
                                        Activo
                                    </option>

                                    <option
                                        value="inactivo"
                                        ${producto?.estado === "inactivo" ? "selected" : ""}
                                    >
                                        Inactivo
                                    </option>

                                </select>

                            </div>

                        </div>


                        <div class="acciones-formulario">

                            <button
                                type="button"
                                onclick="mostrarProductosVenta()"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                            >
                                ${producto ? "Guardar cambios" : "Guardar producto"}
                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>

    `;
}

function guardarProductoVenta(event, id = null){

    event.preventDefault();

    const productos = obtenerProductosVenta();

    const nombre = document
        .getElementById("nombreProductoVenta")
        .value
        .trim();

    const codigo = document
        .getElementById("codigoProductoVenta")
        .value
        .trim();

    const categoria = document
        .getElementById("categoriaProductoVenta")
        .value
        .trim();

    const precio = Number(
        document.getElementById("precioProductoVenta").value
    );

    const estado = document
        .getElementById("estadoProductoVenta")
        .value;

    if(!nombre){
        alert("Escribe el nombre del producto.");
        return;
    }

    if(isNaN(precio) || precio < 0){
        alert("Ingresa un precio válido.");
        return;
    }

    if(id){

        const producto = productos.find(
            p => String(p.id) === String(id)
        );

        if(!producto){
            alert("Producto no encontrado.");
            return;
        }

        producto.codigo = codigo;
        producto.nombre = nombre;
        producto.categoria = categoria;
        producto.precio = precio;
        producto.estado = estado;
        producto.fechaModificacion = new Date().toISOString();

    }else{

        productos.push({

            id: Date.now(),

            codigo,
            nombre,
            categoria,
            precio,
            estado,

            fechaRegistro: new Date().toISOString(),

            fechaModificacion: new Date().toISOString()

        });

    }

    guardarProductosVenta(productos);

    alert(
        id
        ? "Producto actualizado correctamente."
        : "Producto registrado correctamente."
    );

    mostrarProductosVenta();
}

function editarProductoVenta(id){

    mostrarFormularioProductoVenta(id);
}


function eliminarCatalogoProductoVenta(id){

    const productos = obtenerProductosVenta();

    const producto = productos.find(
        p => String(p.id) === String(id)
    );

    if(!producto){
        return;
    }

    const confirmar = confirm(
        `¿Deseas eliminar "${producto.nombre}"?`
    );

    if(!confirmar){
        return;
    }

    const nuevosProductos = productos.filter(
        p => String(p.id) !== String(id)
    );

    guardarProductosVenta(nuevosProductos);

    mostrarProductosVenta();

    renderizarCarritoVenta();

}


/* =========================================================
   AGREGAR PRODUCTO A LA VENTA
   ========================================================= */

function agregarProductoVenta(id){

    const productos = obtenerProductosVenta();

    const producto = productos.find(
        item => String(item.id) === String(id)
    );

    if(!producto){

        alert("No se encontró el producto de venta.");
        return;

    }

    const existente = carritoVenta.find(
        item => String(item.productoId) === String(id)
    );

    if(existente){

        existente.cantidad += 1;

    }else{

        carritoVenta.push({

            productoId: producto.id,
            codigo: producto.codigo || "",
            nombre: producto.nombre,
            unidad: "platillo",
            precio: Number(producto.precio || 0),
            cantidad: 1

        });

    }

    renderizarCarritoVenta();

}

/* =========================================================
   CAMBIAR CANTIDAD DE PLATILLOS
   ========================================================= */

function cambiarCantidadVenta(index, nuevaCantidad){

    nuevaCantidad = Number(nuevaCantidad);

    if(
        !Number.isInteger(nuevaCantidad) ||
        nuevaCantidad < 0
    ){
        alert("Ingresa una cantidad válida de platillos.");
        renderizarCarritoVenta();
        return;
    }

    if(nuevaCantidad === 0){
        eliminarProductoVenta(index);
        return;
    }

    const item = carritoVenta[index];

    if(!item){
        return;
    }

    const producto = obtenerProductosVenta().find(
        p => String(p.id) === String(item.productoId)
    );

    if(!producto){
        alert("El platillo ya no existe en Productos de venta.");
        return;
    }

    item.cantidad = nuevaCantidad;

    renderizarCarritoVenta();

}


/* =========================================================
   ELIMINAR PRODUCTO DEL CARRITO
   ========================================================= */

function eliminarProductoVenta(index){

    carritoVenta.splice(index, 1);

    renderizarCarritoVenta();

}


/* =========================================================
   RENDERIZAR CARRITO
   ========================================================= */

function renderizarCarritoVenta(){

    const contenedor =
        document.getElementById("carritoVenta");

    const resumen =
        document.getElementById("resumenVenta");


    if(!contenedor || !resumen){
        return;
    }


    if(carritoVenta.length === 0){

        contenedor.innerHTML = `

            <div class="mensaje-vacio">

                <h3>Venta vacía</h3>

                <p>
                    Selecciona productos para comenzar.
                </p>

            </div>

        `;


        resumen.innerHTML = "";

        return;

    }


    let subtotal = 0;


    contenedor.innerHTML = `

        <div class="tabla-venta">

            ${carritoVenta.map((item, index) => {

                const importe =
                    Number(item.precio) *
                    Number(item.cantidad);

                subtotal += importe;


                return `

                    <div class="item-venta">

                        <div class="item-venta-info">

                            <strong>
                                ${item.nombre}
                            </strong>

                            <small>
                                ${item.unidad}
                                ·
                                $${Number(item.precio).toFixed(2)}
                            </small>

                        </div>


                        <div class="item-venta-cantidad">

                            <button
                                type="button"
                                onclick="cambiarCantidadVenta(
                                    ${index},
                                    ${Number(item.cantidad) - 1}
                                )"
                            >
                                −
                            </button>


                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value="${item.cantidad}"
                                onchange="cambiarCantidadVenta(
                                    ${index},
                                    this.value
                                )"
                            >


                            <button
                                type="button"
                                onclick="cambiarCantidadVenta(
                                    ${index},
                                    ${Number(item.cantidad) + 1}
                                )"
                            >
                                +
                            </button>

                        </div>


                        <strong>
                            $${importe.toFixed(2)}
                        </strong>


                        <button
                            type="button"
                            onclick="eliminarProductoVenta(${index})"
                            title="Eliminar"
                        >
                            ✕
                        </button>

                    </div>

                `;

            }).join("")}

        </div>

    `;


    resumen.innerHTML = `

        <div class="resumen-venta">

            <div>

                <span>
                    Subtotal
                </span>

                <strong>
                    $${subtotal.toFixed(2)}
                </strong>

            </div>


            <div>

                <span>
                    Total
                </span>

                <strong class="total-venta">
                    $${subtotal.toFixed(2)}
                </strong>

            </div>


            <div class="metodo-pago">

                <label>
                    Método de pago
                </label>


                <select id="metodoPagoVenta">

                    <option value="Efectivo">
                        Efectivo
                    </option>

                    <option value="Tarjeta">
                        Tarjeta
                    </option>

                    <option value="Transferencia">
                        Transferencia
                    </option>

                </select>

            </div>


            <button
                type="button"
                class="btn-principal"
                onclick="registrarVenta()"
            >
                REGISTRAR VENTA
            </button>

        </div>

    `;

}


/* =========================================================
   REGISTRAR VENTA CON DESCUENTO POR RECETA
   ========================================================= */

function registrarVenta(){

    if(carritoVenta.length === 0){
        alert("Agrega al menos un producto a la venta.");
        return;
    }

    const productosVenta = obtenerProductosVenta();
    const inventario = obtenerInventario();
    const recetas = obtenerRecetas();

    const consumos = new Map();

    let subtotal = 0;
    const itemsVenta = [];

    /*
       VALIDAR PLATILLOS, RECETAS Y CANTIDADES
    */

    for(const item of carritoVenta){

        const producto = productosVenta.find(
            p => String(p.id) === String(item.productoId)
        );

        if(!producto || producto.estado === "inactivo"){
            alert("El platillo " + item.nombre + " ya no está disponible.");
            return;
        }

        const cantidad = Number(item.cantidad);

        if(!Number.isInteger(cantidad) || cantidad <= 0){
            alert("Cantidad inválida para " + item.nombre);
            return;
        }

        const receta = recetas.find(
            r => String(r.productoId) === String(producto.id)
        );

        if(
            !receta ||
            !Array.isArray(receta.ingredientes) ||
            receta.ingredientes.length === 0
        ){
            alert("El platillo " + producto.nombre + " no tiene receta registrada.");
            return;
        }

        for(const ingrediente of receta.ingredientes){

            const insumo = inventario.find(
                p => String(p.id) === String(ingrediente.productoId)
            );

            if(!insumo){
                alert(
                    "Falta un ingrediente de la receta de " +
                    producto.nombre +
                    " en Inventario."
                );
                return;
            }

            const cantidadReceta = Number(ingrediente.cantidad);

            if(
                !Number.isFinite(cantidadReceta) ||
                cantidadReceta <= 0
            ){
                alert("Cantidad inválida en la receta de " + producto.nombre);
                return;
            }

            const consumo = cantidadReceta * cantidad;
            const clave = String(insumo.id);

            consumos.set(
                clave,
                (consumos.get(clave) || 0) + consumo
            );

        }

        const precio = Number(producto.precio);

        if(!Number.isFinite(precio) || precio < 0){
            alert("Precio inválido para " + producto.nombre);
            return;
        }

        const importe = Number((precio * cantidad).toFixed(2));

        subtotal += importe;

        itemsVenta.push({
            productoId: producto.id,
            codigo: producto.codigo || "",
            nombre: producto.nombre,
            unidad: "platillo",
            cantidad: cantidad,
            precio: precio,
            importe: importe
        });

    }

    /*
       VALIDAR TODAS LAS EXISTENCIAS ANTES DE DESCONTAR
    */

    for(const [id, consumo] of consumos){

        const insumo = inventario.find(
            p => String(p.id) === id
        );

        const existencia = Number(insumo.existencia);

        if(!Number.isFinite(existencia) || existencia < 0){
            alert("Existencia inválida de " + insumo.nombre);
            return;
        }

        if(existencia + 0.000000001 < consumo){
            alert(
                "Inventario insuficiente de " + insumo.nombre +
                ". Disponible: " + existencia + " " +
                (insumo.unidad || "") +
                ". Necesario: " + Number(consumo.toFixed(6))
            );
            return;
        }

    }

    /*
       PREPARAR VENTA
    */

    const metodoPagoElement =
        document.getElementById("metodoPagoVenta");

    const metodoPago = metodoPagoElement
        ? metodoPagoElement.value
        : "Efectivo";

    const total = Number(subtotal.toFixed(2));
    const folio = generarFolioVenta();
    const fecha = new Date().toISOString();

    const usuario =
        typeof USUARIO_ACTUAL !== "undefined"
            ? USUARIO_ACTUAL.nombre
            : "Administrador";

    const venta = {
        id: Date.now(),
        folio: folio,
        fecha: fecha,
        usuario: usuario,
        items: itemsVenta,
        subtotal: total,
        descuento: 0,
        total: total,
        metodoPago: metodoPago,
        estado: "Completada"
    };

    /*
       DESCONTAR INGREDIENTES Y REGISTRAR MOVIMIENTOS
    */

    const movimientos = obtenerMovimientosInventario();

    for(const [id, consumo] of consumos){

        const insumo = inventario.find(
            p => String(p.id) === id
        );

        const existenciaAnterior = Number(insumo.existencia);

        const existenciaNueva = Number(
            (existenciaAnterior - consumo).toFixed(6)
        );

        insumo.existencia = existenciaNueva;
        insumo.fechaModificacion = fecha;

        movimientos.push({
            id: Date.now() + Math.floor(Math.random() * 100000),
            productoId: insumo.id,
            productoNombre: insumo.nombre,
            tipo: "Salida",
            cantidad: Number(consumo.toFixed(6)),
            unidad: insumo.unidad || "",
            existenciaAnterior: existenciaAnterior,
            existenciaNueva: existenciaNueva,
            motivo: "Consumo por venta " + folio,
            ventaId: venta.id,
            folioVenta: folio,
            usuario: usuario,
            fecha: fecha
        });

    }

    /*
       GUARDAR RESULTADOS
    */

    const ventas = obtenerVentas();

    ventas.push(venta);

    guardarInventario(inventario);
    guardarMovimientosInventario(movimientos);
    guardarVentas(ventas);

    carritoVenta = [];

    alert(
        "Venta registrada correctamente.\n\n" +
        "Folio: " + folio + "\n" +
        "Total: $" + total.toFixed(2) + "\n" +
        "Pago: " + metodoPago
    );

    mostrarVentas();

}

/* =========================================================
   VENTAS DEL DÍA
   ========================================================= */

function obtenerVentasDelDia(){

    const ventas =
        obtenerVentas();


    const hoy =
        new Date();


    const año =
        hoy.getFullYear();


    const mes =
        String(
            hoy.getMonth() + 1
        ).padStart(2, "0");


    const dia =
        String(
            hoy.getDate()
        ).padStart(2, "0");


    const fechaHoy =
        `${año}-${mes}-${dia}`;


    return ventas.filter(venta => {

        if(!venta.fecha){
            return false;
        }


        return venta.fecha.startsWith(
            fechaHoy
        );

    });

}


/* =========================================================
   TOTAL DE VENTAS DEL DÍA
   ========================================================= */

function obtenerTotalVentasDelDia(){

    const ventas =
        obtenerVentasDelDia();


    return ventas.reduce(
        (total, venta) =>
            total +
            Number(venta.total || 0),
        0
    );

}

/* =========================================================
   CORTE DE CAJA
   ========================================================= */

function mostrarCorteCaja(){

    const app = document.getElementById("app");

    const ventas = obtenerVentas().filter(venta => {

        if(!venta.fecha || venta.estado !== "Completada"){
            return false;
        }

        const fechaVenta = new Date(venta.fecha);
        const hoy = new Date();

        return (
            fechaVenta.getFullYear() === hoy.getFullYear() &&
            fechaVenta.getMonth() === hoy.getMonth() &&
            fechaVenta.getDate() === hoy.getDate()
        );

    });

    let efectivo = 0;
    let tarjeta = 0;
    let transferencia = 0;
    let total = 0;
    let platillos = 0;

    ventas.forEach(venta => {

        const importe = Number(venta.total || 0);

        total += importe;

        if(venta.metodoPago === "Efectivo"){
            efectivo += importe;
        }

        if(venta.metodoPago === "Tarjeta"){
            tarjeta += importe;
        }

        if(venta.metodoPago === "Transferencia"){
            transferencia += importe;
        }

        (venta.items || []).forEach(item => {
            platillos += Number(item.cantidad || 0);
        });

    });

    const dinero = cantidad =>
        "$" + cantidad.toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    const filas = ventas.map(venta => `

        <tr>
            <td>${venta.folio}</td>

            <td>
                ${new Date(venta.fecha).toLocaleTimeString(
                    "es-MX",
                    {hour:"2-digit",minute:"2-digit"}
                )}
            </td>

            <td>
                ${(venta.items || []).map(item =>
                    `${item.cantidad} × ${item.nombre}`
                ).join(", ")}
            </td>

            <td>${venta.metodoPago}</td>

            <td>
                <strong>${dinero(Number(venta.total || 0))}</strong>
            </td>
        </tr>

    `).join("");

    app.innerHTML = `

        <div class="pantalla">

            <header class="topbar">

                <div>
                    <h1>Corte de caja</h1>
                    <p>Resumen de ventas del día</p>
                </div>

                <button
                    type="button"
                    onclick="mostrarVentas()"
                >
                    ← Ventas
                </button>

            </header>

            <main class="contenido">

            <div style="
    display:flex;
    justify-content:flex-end;
    margin-bottom:16px;
">
   
<button
    type="button"
    onclick="abrirCaja()"
    style="
        background:#174f86;
        color:white;
        border:none;
        border-radius:10px;
        padding:12px 18px;
        font-weight:600;
        cursor:pointer;
    "
>
    ABRIR CAJA
</button>

<button
    type="button"
    onclick="cerrarCaja()"
    style="
        background:#174f86;
        color:white;
        border:none;
        border-radius:10px;
        padding:12px 18px;
        font-weight:600;
        cursor:pointer;
        margin-left:10px;
    "
>
    CERRAR CAJA
</button>

</div>


                <section class="bienvenida">

                    <div>
                        <div class="etiqueta">
                            CONTROL DE CAJA
                        </div>

                        <h1>
                            Resumen de ingresos
                        </h1>

                        <p>
                            ${new Date().toLocaleDateString("es-MX", {
                                day:"2-digit",
                                month:"long",
                                year:"numeric"
                            })}
                        </p>
                    </div>

                </section>

                <section class="indicadores">

                    <article class="indicador">
                        <div>
                            <span>VENTAS REGISTRADAS</span>
                            <strong>${ventas.length}</strong>
                            <small>Operaciones del día</small>
                        </div>
                    </article>

                    <article class="indicador">
                        <div>
                            <span>PLATILLOS VENDIDOS</span>
                            <strong>${platillos}</strong>
                            <small>Unidades vendidas</small>
                        </div>
                    </article>

                    <article class="indicador">
                        <div>
                            <span>TOTAL VENDIDO</span>
                            <strong>${dinero(total)}</strong>
                            <small>Ingresos por ventas</small>
                        </div>
                    </article>

                </section>

                <section class="panel">

                    <div class="panel-cabecera">
                        <div>
                            <span>FORMAS DE PAGO</span>
                            <h2>Distribución de ingresos</h2>
                        </div>
                    </div>

                    <div style="
                        display:grid;
                        grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
                        gap:16px;
                        padding:15px 0;
                    ">

                        <div>
                            <small>EFECTIVO</small>
                            <h2>${dinero(efectivo)}</h2>
                        </div>

                        <div>
                            <small>TARJETA</small>
                            <h2>${dinero(tarjeta)}</h2>
                        </div>

                        <div>
                            <small>TRANSFERENCIA</small>
                            <h2>${dinero(transferencia)}</h2>
                        </div>

                    </div>

                </section>

                <section class="panel">

                    <div class="panel-cabecera">
                        <div>
                            <span>MOVIMIENTOS</span>
                            <h2>Detalle de ventas</h2>
                        </div>
                    </div>

                    <div style="overflow-x:auto;">

                      <table style="
                        width:100%;
                         min-width:560px;
                         border-collapse:collapse;
                         text-align:left;
                        font-size:13px;
                  ">

                            <thead>
                                <tr>
                                    <th style="padding:12px;">Folio</th>
                                    <th style="padding:12px;">Hora</th>
                                    <th style="padding:12px;">Platillos</th>
                                    <th style="padding:12px;">Pago</th>
                                    <th style="padding:12px;">Total</th>
                                </tr>
                            </thead>

                            <tbody>

                                ${filas || `
                                    <tr>
                                        <td colspan="5" style="padding:16px;">
                                            No hay ventas registradas hoy.
                                        </td>
                                    </tr>
                                `}

                            </tbody>

                        </table>

                    </div>

                </section>

            </main>

        </div>
    `;

}

/* =========================================================
   CONTROL DE JORNADA DE CAJA
   ========================================================= */

const CLAVE_CAJA_ACTUAL = "control_restaurante_caja_actual";

const CLAVE_HISTORIAL_CAJAS = "control_restaurante_historial_cajas";

function obtenerCajaActual() {

    try {

        const datos = localStorage.getItem(CLAVE_CAJA_ACTUAL);

        return datos ? JSON.parse(datos) : null;

    } catch (error) {

        console.error("Error al consultar la caja:", error);

        return null;

    }

}

function guardarCajaActual(caja) {

    localStorage.setItem(
        CLAVE_CAJA_ACTUAL,
        JSON.stringify(caja)
    );

}

function cajaEstaAbierta() {

    const caja = obtenerCajaActual();

    return caja !== null && caja.estado === "Abierta";

}

function obtenerVentasDeCaja(caja) {

    if (!caja || !caja.hora) {
        return [];
    }

    const inicio = new Date(caja.hora).getTime();

    const fin = caja.horaCierre
        ? new Date(caja.horaCierre).getTime()
        : Infinity;

    return obtenerVentas().filter(venta => {

        if (!venta.fecha || venta.estado !== "Completada") {
            return false;
        }

        const momento = new Date(venta.fecha).getTime();

        return momento >= inicio && momento <= fin;

    });

}


/* =========================================================
   APERTURA DE CAJA
   ========================================================= */

function abrirCaja() {

    const cajaActual = obtenerCajaActual();

    if (cajaActual && cajaActual.estado === "Abierta") {
        alert("Ya existe una caja abierta. Debes cerrarla antes de iniciar otra jornada.");
        return;
    }

    const entrada = prompt(
        "Ingresa el fondo inicial de caja (dinero para cambio):",
        "0"
    );

    if (entrada === null) {
        return;
    }

    const texto = entrada.trim().replace(",", ".");

    if (texto === "" || !/^\d+(\.\d{1,2})?$/.test(texto)) {
        alert("Ingresa una cantidad válida, sin valores negativos.");
        return;
    }

    const fondoInicial = Number(texto);

    const apertura = {
        id: Date.now(),
        fecha: obtenerFechaActual(),
        hora: new Date().toISOString(),
        fondoInicial: fondoInicial,
        usuario: USUARIO_ACTUAL.nombre,
        estado: "Abierta",
        horaCierre: null
    };

    guardarCajaActual(apertura);

    alert(
        "Caja abierta correctamente.\n" +
        "Fondo inicial: $" + fondoInicial.toFixed(2)
    );

    mostrarCorteCaja();
}


/* =========================================================
   CIERRE Y ARQUEO DE CAJA
   ========================================================= */

function cerrarCaja() {

    const caja = obtenerCajaActual();

    if (!caja || caja.estado !== "Abierta") {
        alert("No existe una caja abierta para cerrar.");
        return;
    }

    if (USUARIO_ACTUAL.rol !== "Administrador") {
        alert("Solamente un administrador puede cerrar la caja.");
        return;
    }

    const ventas = obtenerVentasDeCaja(caja);

    const ventasEfectivo = ventas.reduce((total, venta) => {
        return total + (
            venta.metodoPago === "Efectivo"
                ? Number(venta.total || 0)
                : 0
        );
    }, 0);

    const fondoInicial = Number(caja.fondoInicial || 0);

    // Los movimientos adicionales de caja se integrarán
    // cuando conectemos el módulo correspondiente.
    const entradasEfectivo = 0;
    const salidasEfectivo = 0;

    const efectivoEsperado =
        fondoInicial +
        ventasEfectivo +
        entradasEfectivo -
        salidasEfectivo;

    const entrada = prompt(
        "ARQUEO DE CAJA\n\n" +
        "Fondo inicial: $" + fondoInicial.toFixed(2) + "\n" +
        "Ventas en efectivo: $" + ventasEfectivo.toFixed(2) + "\n" +
        "Efectivo esperado: $" + efectivoEsperado.toFixed(2) + "\n\n" +
        "¿Cuánto efectivo contaste físicamente?",
        efectivoEsperado.toFixed(2)
    );

    if (entrada === null) return;

    const texto = entrada.trim().replace(",", ".");

    if (texto === "" || !/^\d+(\.\d{1,2})?$/.test(texto)) {
        alert("Ingresa una cantidad válida.");
        return;
    }

    const efectivoContado = Number(texto);

    const diferencia = Number(
        (efectivoContado - efectivoEsperado).toFixed(2)
    );

    const confirmar = confirm(
        "CONFIRMAR CIERRE DE CAJA\n\n" +
        "Efectivo esperado: $" + efectivoEsperado.toFixed(2) + "\n" +
        "Efectivo contado: $" + efectivoContado.toFixed(2) + "\n" +
        "Diferencia: $" + diferencia.toFixed(2) + "\n\n" +
        "¿Deseas cerrar definitivamente esta jornada?"
    );

    if (!confirmar) return;

    const cierre = {
        ...caja,
        estado: "Cerrada",
        horaCierre: new Date().toISOString(),
        fondoInicial,
        ventasEfectivo,
        entradasEfectivo,
        salidasEfectivo,
        efectivoEsperado,
        efectivoContado,
        diferencia,
        usuarioCierre: USUARIO_ACTUAL.nombre
    };

    let historial = [];

    try {
        historial = JSON.parse(
            localStorage.getItem(CLAVE_HISTORIAL_CAJAS) || "[]"
        );

        if (!Array.isArray(historial)) historial = [];
    } catch (error) {
        historial = [];
    }

    historial.push(cierre);

    localStorage.setItem(
        CLAVE_HISTORIAL_CAJAS,
        JSON.stringify(historial)
    );

    guardarCajaActual(cierre);

    alert(
        "Caja cerrada correctamente.\n" +
        "Diferencia: $" + diferencia.toFixed(2)
    );

    mostrarCorteCaja();
}

