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
                    ${USUARIO_ACTUAL.nombre} · ${USUARIO_ACTUAL.rol}
                </p>

            </section>

        </main>
    `;
}


/* =========================================================
   INICIAR JORNADA
   ========================================================= */

function iniciarJornada() {

    const jornadaExistente = obtenerJornadaActual();

    if (jornadaExistente) {

        mostrarDashboard(jornadaExistente);

        return;
    }

    const ahora = new Date();

    const jornada = {

        usuario: USUARIO_ACTUAL.nombre,

        rol: USUARIO_ACTUAL.rol,

        fecha: obtenerFechaActual(),

        entrada: ahora.toLocaleTimeString(
            "es-MX",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        ),

        salida: null,

        timestampEntrada: ahora.getTime(),

        timestampSalida: null,

        horasTrabajadas: null,

        estado: "activa"
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

    const jornada = obtenerJornadaActual();

    if (!jornada) {

        mostrarPantallaJornada();

        return;
    }


    if (jornada.estado === "finalizada") {

        mostrarDashboard(jornada);

        return;
    }


    const confirmar = confirm(
        "¿Deseas terminar tu jornada de hoy?"
    );


    if (!confirmar) {
        return;
    }


    const ahora = new Date();


    jornada.salida = ahora.toLocaleTimeString(
        "es-MX",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );


    jornada.timestampSalida = ahora.getTime();


    jornada.horasTrabajadas =
        calcularHorasTrabajadas(
            jornada.timestampEntrada,
            jornada.timestampSalida
        );


    jornada.estado = "finalizada";


    localStorage.setItem(
        CLAVE_JORNADA,
        JSON.stringify(jornada)
    );


    mostrarDashboard(jornada);
}


/* =========================================================
   CALCULAR HORAS
   ========================================================= */

function calcularHorasTrabajadas(
    entrada,
    salida
) {

    const diferencia = salida - entrada;

    const minutosTotales =
        Math.floor(
            diferencia / 60000
        );


    const horas =
        Math.floor(
            minutosTotales / 60
        );


    const minutos =
        minutosTotales % 60;


    return `${horas} h ${minutos} min`;
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function mostrarDashboard(jornada) {

    const app = document.getElementById("app");

    const jornadaActiva =
        jornada &&
        jornada.estado === "activa";


    const estadoJornada = jornadaActiva
        ? `
            <div class="estado-jornada">

                <span class="punto-verde"></span>

                Jornada iniciada a las
                <strong>
                    ${jornada.entrada}
                </strong>

            </div>
        `
        : `
            <div class="estado-jornada estado-jornada-finalizada">

                <span class="punto-gris"></span>

                Jornada finalizada a las
                <strong>
                    ${jornada.salida}
                </strong>

                · ${jornada.horasTrabajadas}

            </div>
        `;


    const botonJornada = jornadaActiva
        ? `
            <button
                class="btn-terminar-jornada"
                type="button"
                onclick="terminarJornada()">

                🏁 TERMINAR JORNADA

            </button>
        `
        : `
            <div class="jornada-finalizada-info">

                ✓ Jornada de hoy finalizada

                <span>
                    ${jornada.horasTrabajadas}
                </span>

            </div>
        `;


    const inventario =
        obtenerInventario();


    const alertasInventario =
        obtenerProductosBajoMinimo(
            inventario
        ).length;


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
                    type="button"
                    title="Usuario actual">

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
                            PANEL DE CONTROL
                        </div>

                        <h1>
                            Buenos días,
                            ${USUARIO_ACTUAL.nombre}
                        </h1>

                        <p>
                            Aquí tienes el estado actual
                            de la operación del restaurante.
                        </p>

                    </div>


                    <div class="resumen-jornada">

                        ${estadoJornada}

                        ${botonJornada}

                    </div>

                </section>


                <section class="indicadores">


                    <article class="indicador">

                        <div class="indicador-icono positivo">
                            $
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

                        <div class="indicador-icono negativo">
                            −
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
                            $
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

                        <div class="indicador-icono negativo">
                            !
                        </div>

                        <div>

                            <span>
                                ALERTAS
                            </span>

                            <strong>
                                ${alertasInventario}
                            </strong>

                            <small>
                                Pendientes
                            </small>

                        </div>

                    </article>


                </section>


                <section class="dashboard-grid">


                    <article class="panel">

                        <div class="panel-cabecera">

                            <div>

                                <span>
                                    OPERACIÓN
                                </span>

                                <h2>
                                    Actividad reciente
                                </h2>

                            </div>

                            <button
                                class="texto-boton"
                                type="button">

                                Ver todo

                            </button>

                        </div>


                        <div class="actividad">


                            <div class="actividad-item">

                                <div class="actividad-icono positivo">
                                    $
                                </div>

                                <div class="actividad-info">

                                    <strong>
                                        Sin movimientos registrados
                                    </strong>

                                    <span>
                                        Los movimientos aparecerán aquí
                                    </span>

                                </div>

                            </div>


                            <div class="actividad-item">

                                <div class="actividad-icono">
                                    ✓
                                </div>

                                <div class="actividad-info">

                                    <strong>
                                        Jornada
                                    </strong>

                                    <span>
                                        ${
                                            jornadaActiva
                                            ? `Iniciada a las ${jornada.entrada}`
                                            : `Finalizada a las ${jornada.salida}`
                                        }
                                    </span>

                                </div>

                            </div>


                        </div>

                    </article>


                    <article class="panel">

                        <div class="panel-cabecera">

                            <div>

                                <span>
                                    ATENCIÓN
                                </span>

                                <h2>
                                    Alertas
                                </h2>

                            </div>

                            <span class="contador-alertas">
                                ${alertasInventario}
                            </span>

                        </div>


                        <div class="alertas">

                            ${
                                alertasInventario === 0
                                ? `
                                    <div class="alerta alerta-amarilla">

                                        <div class="alerta-icono">
                                            ✓
                                        </div>

                                        <div>

                                            <strong>
                                                Todo en orden
                                            </strong>

                                            <span>
                                                No hay alertas pendientes.
                                            </span>

                                        </div>

                                    </div>
                                `
                                : `
                                    <div class="alerta alerta-amarilla">

                                        <div class="alerta-icono">
                                            !
                                        </div>

                                        <div>

                                            <strong>
                                                Stock bajo
                                            </strong>

                                            <span>
                                                ${alertasInventario}
                                                producto(s) requieren atención.
                                            </span>

                                        </div>

                                    </div>
                                `
                            }

                        </div>

                    </article>


                </section>


                <section class="accesos">

                    <div class="panel-cabecera">

                        <div>

                            <span>
                                OPERACIÓN
                            </span>

                            <h2>
                                Accesos rápidos
                            </h2>

                        </div>

                    </div>


                    <div class="dashboard-grid">


                        <button
                            class="accion-principal"
                            type="button"
                            onclick="mostrarPersonal()">

                            <span class="accion-icono">
                                👥
                            </span>

                            <span class="accion-texto">

                                <strong>
                                    Personal
                                </strong>

                                <small>
                                    Empleados y jornadas
                                </small>

                            </span>

                        </button>


                        <button
                            class="accion-principal"
                            type="button"
                            onclick="mostrarInventario()">

                            <span class="accion-icono">
                                📦
                            </span>

                            <span class="accion-texto">

                                <strong>
                                    Inventario
                                </strong>

                                <small>
                                    Existencias y mínimos
                                </small>

                            </span>

                        </button>


                        <button
                            class="accion-principal"
                            type="button">

                            <span class="accion-icono">
                                🧾
                            </span>

                            <span class="accion-texto">

                                <strong>
                                    Tickets
                                </strong>

                                <small>
                                    Compras y validación
                                </small>

                            </span>

                        </button>


                        <button
                            class="accion-principal"
                            type="button">

                            <span class="accion-icono">
                                💰
                            </span>

                            <span class="accion-texto">

                                <strong>
                                    Caja
                                </strong>

                                <small>
                                    Entradas y salidas
                                </small>

                            </span>

                        </button>


                    </div>

                </section>


            </main>


            <nav class="navegacion-movil">

                <button
                    type="button"
                    onclick="mostrarDashboard(obtenerJornadaActual())">

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
   PERSONAL
   ========================================================= */

function mostrarPersonal() {

    const app = document.getElementById("app");

    const empleados = obtenerEmpleados();


    app.innerHTML = `

        <div class="sistema">

            <header class="topbar">

                <div class="marca">

                    <button
                        class="texto-boton"
                        type="button"
                        onclick="regresarDashboard()">

                        ← Regresar

                    </button>

                    <div class="marca-icono">
                        CR
                    </div>

                    <div>

                        <strong>
                            Personal
                        </strong>

                        <small>
                            Control Restaurante
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
                            ADMINISTRACIÓN
                        </div>

                        <h1>
                            Personal
                        </h1>

                        <p>
                            Administra empleados,
                            puestos y condiciones de trabajo.
                        </p>

                    </div>


                    <button
                        class="btn-agregar-personal"
                        type="button"
                        onclick="mostrarFormularioEmpleado()">

                        + Agregar personal

                    </button>

                </section>


                <section class="resumen-jornada">

                    <div class="estado-jornada">

                        <span class="punto-verde"></span>

                        Personal registrado:

                        <strong>
                            ${empleados.length}
                        </strong>

                    </div>

                </section>


                <section class="panel panel-personal">

                    <div class="panel-cabecera">

                        <div>

                            <span>
                                PLANTILLA
                            </span>

                            <h2>
                                Empleados
                            </h2>

                        </div>

                        <span class="contador-alertas">
                            ${empleados.length}
                        </span>

                    </div>


                    <div id="lista-personal">

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
   OBTENER EMPLEADOS
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


/* =========================================================
   GUARDAR EMPLEADOS
   ========================================================= */

function guardarEmpleados(empleados) {

    localStorage.setItem(
        CLAVE_EMPLEADOS,
        JSON.stringify(empleados)
    );
}


/* =========================================================
   RENDERIZAR EMPLEADOS
   ========================================================= */

function renderizarEmpleados(empleados) {

    if (!empleados.length) {

        return `

            <div class="personal-vacio">

                <div>
                    👥
                </div>

                <h3>
                    Aún no hay personal registrado
                </h3>

                <p>
                    Agrega el primer empleado
                    para comenzar a administrar
                    la plantilla.
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
        (empleado, indice) => {

            const iniciales =
                obtenerIniciales(
                    empleado.nombre
                );


            return `

                <article class="empleado-item">

                    <div class="empleado-avatar">
                        ${iniciales}
                    </div>


                    <div class="empleado-info">

                        <strong>
                            ${empleado.nombre}
                        </strong>

                        <span>
                            ${empleado.tipoContrato}
                            ·
                            ${empleado.jornada}
                        </span>

                        <small>
                            Ingreso:
                            ${formatearFecha(
                                empleado.fechaIngreso
                            )}
                        </small>

                    </div>


                    <div class="empleado-estado">

                        <span class="estado-activo">

                            ${empleado.estado}

                        </span>

                    </div>


                    <button
                        class="empleado-eliminar"
                        type="button"
                        title="Eliminar empleado"
                        onclick="eliminarEmpleado(${indice})">

                        ×

                    </button>

                </article>

            `;
        }
    ).join("");
}


/* =========================================================
   FORMULARIO PERSONAL
   ========================================================= */

function mostrarFormularioEmpleado() {

    const app = document.getElementById("app");


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
                            Nuevo empleado
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
                            Registrar empleado
                        </h1>

                        <p>
                            Captura los datos básicos
                            del colaborador.
                        </p>

                    </div>

                </section>


                <section class="panel">

                    <form
                        class="formulario-personal"
                        onsubmit="guardarEmpleado(event)">


                        <div class="formulario-grid">


                            <div class="campo campo-completo">

                                <label>
                                    Nombre completo
                                </label>

                                <input
                                    type="text"
                                    id="nombreEmpleado"
                                    required
                                    placeholder="Nombre completo">

                            </div>


                            <div class="campo">

                                <label>
                                    Teléfono
                                </label>

                                <input
                                    type="tel"
                                    id="telefonoEmpleado"
                                    placeholder="Teléfono">

                            </div>


                            <div class="campo">

                                <label>
                                    Fecha de ingreso
                                </label>

                                <input
                                    type="date"
                                    id="fechaIngresoEmpleado"
                                    required>

                            </div>


                            <div class="campo campo-completo">

                                <label>
                                    Dirección
                                </label>

                                <input
                                    type="text"
                                    id="direccionEmpleado"
                                    placeholder="Domicilio">

                            </div>


                            <div class="campo">

                                <label>
                                    Tipo de contrato
                                </label>

                                <select
                                    id="tipoContratoEmpleado"
                                    required>

                                    <option value="">
                                        Seleccionar
                                    </option>

                                    <option>
                                        Tiempo completo
                                    </option>

                                    <option>
                                        Medio tiempo
                                    </option>

                                    <option>
                                        Fines de semana
                                    </option>

                                    <option>
                                        Temporal
                                    </option>

                                    <option>
                                        Estacional
                                    </option>

                                </select>

                            </div>


                            <div class="campo">

                                <label>
                                    Jornada
                                </label>

                                <select
                                    id="jornadaEmpleado"
                                    required>

                                    <option value="">
                                        Seleccionar
                                    </option>

                                    <option>
                                        Completa
                                    </option>

                                    <option>
                                        Parcial
                                    </option>

                                    <option>
                                        Variable
                                    </option>

                                </select>

                            </div>


                            <div class="campo">

                                <label>
                                    Estado
                                </label>

                                <select
                                    id="estadoEmpleado"
                                    required>

                                    <option value="Activo">
                                        Activo
                                    </option>

                                    <option value="Inactivo">
                                        Inactivo
                                    </option>

                                </select>

                            </div>


                            <div class="campo campo-completo">

                                <label>
                                    Observaciones
                                </label>

                                <textarea
                                    id="observacionesEmpleado"
                                    rows="4"
                                    placeholder="Observaciones adicionales"></textarea>

                            </div>


                        </div>


                        <div class="acciones-formulario">

                            <button
                                type="button"
                                class="btn-secundario"
                                onclick="mostrarPersonal()">

                                Cancelar

                            </button>


                            <button
                                type="submit"
                                class="btn-principal">

                                Guardar empleado

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

function guardarEmpleado(event) {

    event.preventDefault();


    const empleado = {

        id:
            Date.now(),

        nombre:
            document
                .getElementById(
                    "nombreEmpleado"
                )
                .value
                .trim(),

        telefono:
            document
                .getElementById(
                    "telefonoEmpleado"
                )
                .value
                .trim(),

        direccion:
            document
                .getElementById(
                    "direccionEmpleado"
                )
                .value
                .trim(),

        fechaIngreso:
            document
                .getElementById(
                    "fechaIngresoEmpleado"
                )
                .value,

        tipoContrato:
            document
                .getElementById(
                    "tipoContratoEmpleado"
                )
                .value,

        jornada:
            document
                .getElementById(
                    "jornadaEmpleado"
                )
                .value,

        estado:
            document
                .getElementById(
                    "estadoEmpleado"
                )
                .value,

        observaciones:
            document
                .getElementById(
                    "observacionesEmpleado"
                )
                .value
                .trim(),

        fechaRegistro:
            new Date().toISOString()
    };


    const empleados =
        obtenerEmpleados();


    empleados.push(
        empleado
    );


    guardarEmpleados(
        empleados
    );


    mostrarPersonal();
}


/* =========================================================
   ELIMINAR EMPLEADO
   ========================================================= */

function eliminarEmpleado(indice) {

    const empleados =
        obtenerEmpleados();


    if (
        !empleados[indice]
    ) {
        return;
    }


    const confirmar =
        confirm(
            `¿Deseas eliminar a ${empleados[indice].nombre}?`
        );


    if (!confirmar) {
        return;
    }


    empleados.splice(
        indice,
        1
    );


    guardarEmpleados(
        empleados
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


/* =========================================================
   GUARDAR INVENTARIO
   ========================================================= */

function guardarInventario(productos) {

    localStorage.setItem(
        CLAVE_INVENTARIO,
        JSON.stringify(productos)
    );
}


/* =========================================================
   PRODUCTOS BAJO MÍNIMO
   ========================================================= */

function obtenerProductosBajoMinimo(productos) {

    return productos.filter(
        producto =>
            Number(producto.existencia) <=
            Number(producto.stockMinimo)
    );
}


/* =========================================================
   MOSTRAR INVENTARIO
   ========================================================= */

function mostrarInventario() {

    const app = document.getElementById("app");

    const productos =
        obtenerInventario();


    const productosBajos =
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

                        ← Regresar

                    </button>

                    <div class="marca-icono">
                        CR
                    </div>

                    <div>

                        <strong>
                            Inventario
                        </strong>

                        <small>
                            Control Restaurante
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
                            OPERACIÓN
                        </div>

                        <h1>
                            Inventario
                        </h1>

                        <p>
                            Controla existencias,
                            costos y niveles mínimos.
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


                    <article class="indicador">

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

                        <div class="indicador-icono negativo">
                            !
                        </div>

                        <div>

                            <span>
                                STOCK BAJO
                            </span>

                            <strong>
                                ${productosBajos.length}
                            </strong>

                            <small>
                                Requieren atención
                            </small>

                        </div>

                    </article>


                </section>


                <section class="panel panel-personal">


                    <div class="panel-cabecera">

                        <div>

                            <span>
                                CATÁLOGO
                            </span>

                            <h2>
                                Productos
                            </h2>

                        </div>

                        <span class="contador-alertas">
                            ${productos.length}
                        </span>

                    </div>


                    <div style="
                        margin-bottom:20px;
                    ">

                        <input
                            type="search"
                            id="buscarInventario"
                            placeholder="🔎 Buscar producto..."
                            oninput="filtrarInventario(this.value)"
                            style="
                                width:100%;
                                padding:14px 16px;
                                border-radius:12px;
                                border:1px solid rgba(200,164,93,.35);
                                background:#0b192a;
                                color:#fff;
                                font-size:15px;
                                box-sizing:border-box;
                            ">

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
   RENDERIZAR INVENTARIO
   ========================================================= */

function renderizarInventario(productos) {

    if (!productos.length) {

        return `

            <div class="personal-vacio">

                <div>
                    📦
                </div>

                <h3>
                    Aún no hay productos registrados
                </h3>

                <p>
                    Agrega el primer producto
                    para comenzar a controlar
                    el inventario.
                </p>

                <button
                    class="btn-principal"
                    type="button"
                    onclick="mostrarFormularioProducto()">

                    + Agregar producto

                </button>

            </div>

        `;
    }


    return productos.map(
        producto => {

            const stockBajo =
                Number(producto.existencia) <=
                Number(producto.stockMinimo);


            return `

                <article
                    class="empleado-item"
                    style="
                        ${
                            stockBajo
                            ? "border-color:rgba(239,68,68,.65);"
                            : ""
                        }
                    "
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

                            Código:
                            ${producto.codigo}

                            ·

                            Costo:
                            $${Number(
                                producto.costo
                            ).toFixed(2)}

                        </small>

                    </div>


                    <div class="empleado-estado">

                        <span
                            class="${
                                stockBajo
                                ? "estado-activo"
                                : "estado-activo"
                            }"
                            style="${
                                stockBajo
                                ? "background:rgba(239,68,68,.15);color:#ff8b8b;border-color:rgba(239,68,68,.4);"
                                : ""
                            }"
                        >

                            ${producto.existencia}
                            ${producto.unidad}

                        </span>

                    </div>


                   <div style="
    display:flex;
    gap:8px;
    align-items:center;
">

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
        ">

        ✏️

    </button>


    <button
        class="empleado-eliminar"
        type="button"
        title="Eliminar producto"
        onclick="eliminarProducto(${producto.id})">

        ×

    </button>

</div>

                    </button>

                </article>

            `;
        }
    ).join("");
}


/* =========================================================
   FILTRAR INVENTARIO
   ========================================================= */

function filtrarInventario(texto) {

    const productos =
        obtenerInventario();


    const busqueda =
        texto
            .trim()
            .toLowerCase();


    const filtrados =
        productos.filter(
            producto =>
                producto.nombre
                    .toLowerCase()
                    .includes(busqueda) ||

                producto.codigo
                    .toLowerCase()
                    .includes(busqueda) ||

                producto.categoria
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

    const app = document.getElementById("app");


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

                                    <option value="botella">
                                        Botella
                                    </option>

                                </select>

                            </div>


                            <div class="campo">

                                <label>
                                    Existencia actual
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
                                    Costo unitario
                                </label>

                                <input
                                    type="number"
                                    id="costoProducto"
                                    min="0"
                                    step="0.01"
                                    value="0"
                                    required
                                    placeholder="0.00">

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
                                    placeholder="0.00">

                            </div>


                        </div>


                        <div class="acciones-formulario">

                            <button
                                type="button"
                                class="btn-secundario"
                                onclick="mostrarInventario()">

                                Cancelar

                            </button>


                            <button
                                type="submit"
                                class="btn-principal">

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

function guardarProducto(event) {

    event.preventDefault();


    const codigo =
        document
            .getElementById(
                "codigoProducto"
            )
            .value
            .trim()
            .toUpperCase();


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


    const productos =
        obtenerInventario();


    const codigoDuplicado =
        productos.some(
            producto =>
                producto.codigo === codigo
        );


    if (codigoDuplicado) {

        alert(
            "Ya existe un producto con ese código / SKU."
        );

        return;
    }


    const producto = {

        id:
            Date.now(),

        codigo,

        nombre,

        categoria,

        unidad,

        existencia,

        stockMinimo,

        costo,

        precio,

        estado:
            "Activo",

        fechaRegistro:
            new Date().toISOString()
    };


    productos.push(
        producto
    );


    guardarInventario(
        productos
    );


    mostrarInventario();
}

/* =========================================================
   EDITAR PRODUCTO
   ========================================================= */

function editarProducto(id) {

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
                            Modifica la información de:
                            <strong>
                                ${producto.nombre}
                            </strong>
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
                                    id="editarCodigoProducto"
                                    value="${producto.codigo}"
                                    required>

                            </div>


                            <div class="campo">

                                <label>
                                    Nombre del producto
                                </label>

                                <input
                                    type="text"
                                    id="editarNombreProducto"
                                    value="${producto.nombre}"
                                    required>

                            </div>


                            <div class="campo">

                                <label>
                                    Categoría
                                </label>

                                <input
                                    type="text"
                                    id="editarCategoriaProducto"
                                    value="${producto.categoria}"
                                    required>

                            </div>


                            <div class="campo">

                                <label>
                                    Unidad de medida
                                </label>

                                <select
                                    id="editarUnidadProducto"
                                    required>

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

                                    <option value="botella">
                                        Botella
                                    </option>

                                </select>

                            </div>


                            <div class="campo">

                                <label>
                                    Existencia actual
                                </label>

                                <input
                                    type="number"
                                    id="editarExistenciaProducto"
                                    min="0"
                                    step="0.01"
                                    value="${producto.existencia}"
                                    required>

                            </div>


                            <div class="campo">

                                <label>
                                    Stock mínimo
                                </label>

                                <input
                                    type="number"
                                    id="editarStockMinimoProducto"
                                    min="0"
                                    step="0.01"
                                    value="${producto.stockMinimo}"
                                    required>

                            </div>


                            <div class="campo">

                                <label>
                                    Costo unitario
                                </label>

                                <input
                                    type="number"
                                    id="editarCostoProducto"
                                    min="0"
                                    step="0.01"
                                    value="${producto.costo}"
                                    required>

                            </div>


                            <div class="campo">

                                <label>
                                    Precio de venta
                                </label>

                                <input
                                    type="number"
                                    id="editarPrecioProducto"
                                    min="0"
                                    step="0.01"
                                    value="${producto.precio}"
                                    required>

                            </div>


                            <div class="campo">

                                <label>
                                    Estado
                                </label>

                                <select
                                    id="editarEstadoProducto">

                                    <option value="Activo">
                                        Activo
                                    </option>

                                    <option value="Inactivo">
                                        Inactivo
                                    </option>

                                </select>

                            </div>


                        </div>


                        <div class="acciones-formulario">

                            <button
                                type="button"
                                class="btn-secundario"
                                onclick="mostrarInventario()">

                                Cancelar

                            </button>


                            <button
                                type="submit"
                                class="btn-principal">

                                Guardar cambios

                            </button>

                        </div>


                    </form>

                </section>


            </main>

        </div>

    `;


    document.getElementById(
        "editarUnidadProducto"
    ).value = producto.unidad;


    document.getElementById(
        "editarEstadoProducto"
    ).value = producto.estado || "Activo";
}


/* =========================================================
   GUARDAR EDICIÓN DEL PRODUCTO
   ========================================================= */

function guardarEdicionProducto(event, id) {

    event.preventDefault();


    const productos =
        obtenerInventario();


    const indice =
        productos.findIndex(
            producto =>
                producto.id === id
        );


    if (indice === -1) {
        return;
    }


    const codigo =
        document
            .getElementById(
                "editarCodigoProducto"
            )
            .value
            .trim()
            .toUpperCase();


    const codigoDuplicado =
        productos.some(
            (producto, posicion) =>
                producto.codigo === codigo &&
                posicion !== indice
        );


    if (codigoDuplicado) {

        alert(
            "Ya existe otro producto con ese código / SKU."
        );

        return;
    }


    productos[indice].codigo =
        codigo;


    productos[indice].nombre =
        document
            .getElementById(
                "editarNombreProducto"
            )
            .value
            .trim();


    productos[indice].categoria =
        document
            .getElementById(
                "editarCategoriaProducto"
            )
            .value
            .trim();


    productos[indice].unidad =
        document
            .getElementById(
                "editarUnidadProducto"
            )
            .value;


    productos[indice].existencia =
        Number(
            document
                .getElementById(
                    "editarExistenciaProducto"
                )
                .value
        );


    productos[indice].stockMinimo =
        Number(
            document
                .getElementById(
                    "editarStockMinimoProducto"
                )
                .value
        );


    productos[indice].costo =
        Number(
            document
                .getElementById(
                    "editarCostoProducto"
                )
                .value
        );


    productos[indice].precio =
        Number(
            document
                .getElementById(
                    "editarPrecioProducto"
                )
                .value
        );


    productos[indice].estado =
        document
            .getElementById(
                "editarEstadoProducto"
            )
            .value;


    productos[indice].fechaModificacion =
        new Date().toISOString();


    guardarInventario(
        productos
    );


    mostrarInventario();
}


/* =========================================================
   ELIMINAR PRODUCTO
   ========================================================= */

function eliminarProducto(id) {

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


    const nuevosProductos =
        productos.filter(
            item =>
                item.id !== id
        );


    guardarInventario(
        nuevosProductos
    );


    mostrarInventario();
}


/* =========================================================
   REGRESAR DASHBOARD
   ========================================================= */

function regresarDashboard() {

    const jornada =
        obtenerJornadaActual();


    if (!jornada) {

        mostrarPantallaJornada();

        return;
    }


    mostrarDashboard(
        jornada
    );
}


/* =========================================================
   INICIALES
   ========================================================= */

function obtenerIniciales(nombre) {

    if (!nombre) {
        return "CR";
    }


    const palabras =
        nombre
            .trim()
            .split(/\s+/);


    if (palabras.length === 1) {

        return palabras[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        palabras[0][0] +
        palabras[1][0]
    ).toUpperCase();
}


/* =========================================================
   FORMATEAR FECHA
   ========================================================= */

function formatearFecha(fecha) {

    if (!fecha) {
        return "—";
    }


    const partes =
        fecha.split("-");


    if (partes.length !== 3) {
        return fecha;
    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


/* =========================================================
   CAPITALIZAR
   ========================================================= */

function capitalizar(texto) {

    if (!texto) {
        return "";
    }


    return texto.charAt(0).toUpperCase()
        + texto.slice(1);
}


/* =========================================================
   PANTALLA ANTIGUA DE JORNADA FINALIZADA
   ========================================================= */

function mostrarJornadaFinalizada(jornada) {

    mostrarDashboard(jornada);
}


/* =========================================================
   CERRAR SESIÓN
   ========================================================= */

function cerrarSesion() {

    alert(
        "La jornada permanece registrada. " +
        "El acceso al sistema continúa disponible."
    );

}
