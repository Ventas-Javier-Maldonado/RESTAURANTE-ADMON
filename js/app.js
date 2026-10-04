document.addEventListener("DOMContentLoaded", () => {
    iniciarAplicacion();
});

const USUARIO_ACTUAL = {
    nombre: "Rodrigo",
    rol: "Administrador"
};


/* ==========================================
   INICIO DE LA APLICACIÓN
   ========================================== */

function iniciarAplicacion() {
    const jornada = obtenerJornadaActual();

    if (!jornada) {
        mostrarPantallaJornada();
        return;
    }

    if (jornada.estado === "finalizada") {
        mostrarJornadaFinalizada(jornada);
        return;
    }

    mostrarDashboard(jornada);
}


/* ==========================================
   FECHA Y HORA
   ========================================== */

function obtenerFechaActual() {
    const ahora = new Date();

    return ahora.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
}


function obtenerHoraActual() {
    const ahora = new Date();

    return ahora.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit"
    });
}


function obtenerFechaLarga() {
    const ahora = new Date();

    return ahora.toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


/* ==========================================
   JORNADA
   ========================================== */

function obtenerClaveJornada() {
    return `jornada_${USUARIO_ACTUAL.nombre}_${obtenerFechaActual()}`;
}


function obtenerJornadaActual() {
    const clave = obtenerClaveJornada();
    const jornadaGuardada = localStorage.getItem(clave);

    if (!jornadaGuardada) {
        return null;
    }

    try {
        return JSON.parse(jornadaGuardada);
    } catch (error) {
        console.error("No se pudo leer la jornada:", error);
        return null;
    }
}


function iniciarJornada() {

    const jornadaExistente = obtenerJornadaActual();

    if (jornadaExistente) {

        if (jornadaExistente.estado === "finalizada") {
            mostrarJornadaFinalizada(jornadaExistente);
            return;
        }

        mostrarDashboard(jornadaExistente);
        return;
    }

    const ahora = new Date();

    const jornada = {
        usuario: USUARIO_ACTUAL.nombre,
        rol: USUARIO_ACTUAL.rol,
        fecha: obtenerFechaActual(),
        entrada: obtenerHoraActual(),
        salida: null,
        timestampEntrada: ahora.toISOString(),
        timestampSalida: null,
        horasTrabajadas: null,
        estado: "activa"
    };

    localStorage.setItem(
        obtenerClaveJornada(),
        JSON.stringify(jornada)
    );

    mostrarDashboard(jornada);
}


function terminarJornada() {

    const jornada = obtenerJornadaActual();

    if (!jornada) {
        return;
    }

    if (jornada.estado === "finalizada") {
        mostrarJornadaFinalizada(jornada);
        return;
    }

    const confirmar = confirm(
        "¿Seguro que deseas terminar tu jornada?\n\n" +
        "Esta acción registrará tu hora de salida."
    );

    if (!confirmar) {
        return;
    }

    const ahora = new Date();

    jornada.salida = obtenerHoraActual();
    jornada.timestampSalida = ahora.toISOString();

    jornada.horasTrabajadas = calcularHorasTrabajadas(
        jornada.timestampEntrada,
        jornada.timestampSalida
    );

    jornada.estado = "finalizada";

    localStorage.setItem(
        obtenerClaveJornada(),
        JSON.stringify(jornada)
    );

    mostrarJornadaFinalizada(jornada);
}


function calcularHorasTrabajadas(
    timestampEntrada,
    timestampSalida
) {

    const entrada = new Date(timestampEntrada);
    const salida = new Date(timestampSalida);

    const diferencia =
        salida.getTime() - entrada.getTime();

    if (diferencia <= 0) {
        return "0 h 0 min";
    }

    const minutosTotales =
        Math.floor(diferencia / 1000 / 60);

    const horas =
        Math.floor(minutosTotales / 60);

    const minutos =
        minutosTotales % 60;

    return `${horas} h ${minutos} min`;
}


/* ==========================================
   PANTALLA DE JORNADA
   ========================================== */

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
                    Buenos días,<br>
                    ${USUARIO_ACTUAL.nombre}
                </h1>

                <p class="jornada-fecha">
                    ${capitalizarPrimeraLetra(obtenerFechaLarga())}
                </p>

                <div class="jornada-separador"></div>

                <p class="jornada-pregunta">
                    ¿Listo para comenzar tu jornada?
                </p>

                <p class="jornada-info">
                    Al iniciar tu jornada registraremos tu hora de entrada.
                </p>

                <button
                    class="btn-jornada"
                    onclick="iniciarJornada()"
                >
                    <span>▶</span>
                    INICIAR JORNADA
                </button>

                <p class="jornada-rol">
                    ${USUARIO_ACTUAL.rol}
                </p>

            </section>

        </main>
    `;
}


function mostrarJornadaFinalizada(jornada) {

    const app = document.getElementById("app");

    app.innerHTML = `
        <main class="pantalla-jornada">

            <section class="jornada-card">

                <div class="jornada-icono">
                    ✓
                </div>

                <div class="jornada-etiqueta">
                    JORNADA FINALIZADA
                </div>

                <h1>
                    Buen trabajo,<br>
                    ${USUARIO_ACTUAL.nombre}
                </h1>

                <p class="jornada-fecha">
                    ${capitalizarPrimeraLetra(obtenerFechaLarga())}
                </p>

                <div class="jornada-separador"></div>

                <div class="resumen-jornada">

                    <div>
                        <span>Entrada</span>
                        <strong>${jornada.entrada}</strong>
                    </div>

                    <div>
                        <span>Salida</span>
                        <strong>${jornada.salida}</strong>
                    </div>

                    <div>
                        <span>Tiempo registrado</span>
                        <strong>${jornada.horasTrabajadas}</strong>
                    </div>

                </div>

                <p class="jornada-info">
                    Tu jornada de hoy ha quedado registrada.
                </p>

                <button
                    class="btn-jornada"
                    onclick="cerrarSesion()"
                >
                    <span>🚪</span>
                    CERRAR SESIÓN
                </button>

                <p class="jornada-rol">
                    ${USUARIO_ACTUAL.rol}
                </p>

            </section>

        </main>
    `;
}


/* ==========================================
   DASHBOARD
   ========================================== */

function mostrarDashboard(jornada) {

    const app = document.getElementById("app");

    app.innerHTML = `

        <div class="sistema">

            <header class="topbar">

                <div class="marca">

                    <div class="marca-icono">
                        CR
                    </div>

                    <div>

                        <div class="marca-titulo">
                            Control Restaurante
                        </div>

                        <div class="marca-subtitulo">
                            Administración inteligente
                        </div>

                    </div>

                </div>

                <button
                    class="usuario-boton"
                    onclick="terminarJornada()"
                    title="Terminar jornada"
                >

                    <div class="usuario-avatar">
                        ${USUARIO_ACTUAL.nombre.charAt(0)}
                    </div>

                    <div class="usuario-info">

                        <strong>
                            ${USUARIO_ACTUAL.nombre}
                        </strong>

                        <span>
                            ${USUARIO_ACTUAL.rol}
                        </span>

                    </div>

                </button>

            </header>


            <main class="contenido">

                <section class="bienvenida">

                    <div>

                        <span class="etiqueta">
                            ${obtenerFechaLarga().toUpperCase()}
                        </span>

                        <h1>
                            Buenos días, ${USUARIO_ACTUAL.nombre} 👋
                        </h1>

                        <p>
                            Esto es lo que está pasando hoy en tu restaurante.
                        </p>

                    </div>

                    <div class="estado-jornada">

                        <span class="punto-verde"></span>

                        Jornada iniciada a las

                        <strong>
                            ${jornada.entrada}
                        </strong>

                    </div>

                </section>


                <section class="accion-principal">

                    <div class="accion-icono">
                        🧾
                    </div>

                    <div class="accion-texto">

                        <h2>
                            ¿Tienes una compra?
                        </h2>

                        <p>
                            Captura el ticket y deja que el sistema haga el trabajo.
                        </p>

                    </div>

                    <button onclick="capturarTicket()">
                        CAPTURAR TICKET
                    </button>

                </section>


                <section class="indicadores">

                    <article class="indicador">

                        <div class="indicador-icono verde">
                            $
                        </div>

                        <div>
                            <span>Ventas de hoy</span>
                            <strong>$12,850</strong>
                            <small class="positivo">↑ 8.4% vs. ayer</small>
                        </div>

                    </article>


                    <article class="indicador">

                        <div class="indicador-icono amarillo">
                            🧾
                        </div>

                        <div>
                            <span>Compras pendientes</span>
                            <strong>4</strong>
                            <small>Por validar</small>
                        </div>

                    </article>


                    <article class="indicador">

                        <div class="indicador-icono rojo">
                            !
                        </div>

                        <div>
                            <span>Alertas de inventario</span>
                            <strong>3</strong>
                            <small class="negativo">Requieren atención</small>
                        </div>

                    </article>


                    <article class="indicador">

                        <div class="indicador-icono azul">
                            $
                        </div>

                        <div>
                            <span>Caja actual</span>
                            <strong>$8,420</strong>
                            <small>Corte anterior</small>
                        </div>

                    </article>

                </section>


                <section class="dashboard-grid">

                    <article class="panel">

                        <div class="panel-cabecera">

                            <div>
                                <span class="etiqueta">
                                    MOVIMIENTOS
                                </span>

                                <h2>
                                    Actividad reciente
                                </h2>
                            </div>

                            <button class="texto-boton">
                                Ver todo →
                            </button>

                        </div>


                        <div class="actividad">

                            <div class="actividad-item">

                                <div class="actividad-icono verde">
                                    $
                                </div>

                                <div class="actividad-info">

                                    <strong>
                                        Venta registrada
                                    </strong>

                                    <span>
                                        Mesa 4 · Hace 8 min
                                    </span>

                                </div>

                                <b>
                                    +$850
                                </b>

                            </div>


                            <div class="actividad-item">

                                <div class="actividad-icono azul">
                                    🧾
                                </div>

                                <div class="actividad-info">

                                    <strong>
                                        Compra pendiente
                                    </strong>

                                    <span>
                                        Proveedor La Central · Hace 22 min
                                    </span>

                                </div>

                                <b>
                                    $1,240
                                </b>

                            </div>


                            <div class="actividad-item">

                                <div class="actividad-icono naranja">
                                    📦
                                </div>

                                <div class="actividad-info">

                                    <strong>
                                        Entrada de inventario
                                    </strong>

                                    <span>
                                        Tomate saladette · Hace 35 min
                                    </span>

                                </div>

                                <b>
                                    +12 kg
                                </b>

                            </div>


                            <div class="actividad-item">

                                <div class="actividad-icono rojo">
                                    !
                                </div>

                                <div class="actividad-info">

                                    <strong>
                                        Ajuste de inventario
                                    </strong>

                                    <span>
                                        Merma · Hace 1 hora
                                    </span>

                                </div>

                                <b>
                                    -2 kg
                                </b>

                            </div>

                        </div>

                    </article>


                    <article class="panel">

                        <div class="panel-cabecera">

                            <div>

                                <span class="etiqueta">
                                    ATENCIÓN
                                </span>

                                <h2>
                                    Alertas
                                </h2>

                            </div>

                            <span class="contador-alertas">
                                3
                            </span>

                        </div>


                        <div class="alertas">

                            <div class="alerta alerta-roja">

                                <div class="alerta-icono">
                                    !
                                </div>

                                <div>

                                    <strong>
                                        Inventario bajo
                                    </strong>

                                    <p>
                                        Cebolla blanca: quedan 5 kg
                                    </p>

                                </div>

                            </div>


                            <div class="alerta alerta-amarilla">

                                <div class="alerta-icono">
                                    🧾
                                </div>

                                <div>

                                    <strong>
                                        Tickets pendientes
                                    </strong>

                                    <p>
                                        Hay 4 compras por validar
                                    </p>

                                </div>

                            </div>


                            <div class="alerta alerta-naranja">

                                <div class="alerta-icono">
                                    $
                                </div>

                                <div>

                                    <strong>
                                        Reembolso pendiente
                                    </strong>

                                    <p>
                                        Hay un gasto pendiente de reembolso
                                    </p>

                                </div>

                            </div>

                        </div>

                    </article>

                </section>


                <!-- ==========================================
                     ACCESOS RÁPIDOS
                     ========================================== -->

                <section class="accesos">

                    <span class="etiqueta">
                        ACCESOS RÁPIDOS
                    </span>

                    <div>

                        <button onclick="mostrarPersonal()">
                            👥 Personal
                        </button>

                        <button>
                            📦 Inventario
                        </button>

                        <button>
                            🧾 Compras
                        </button>

                        <button>
                            💰 Ventas
                        </button>

                        <button>
                            💵 Caja
                        </button>

                        <button>
                            📊 Reportes
                        </button>

                    </div>

                </section>

            </main>


            <nav class="navegacion-movil">

                <button class="activo">
                    <span>⌂</span>
                    Inicio
                </button>

                <button>
                    <span>📦</span>
                    Inventario
                </button>

                <button>
                    <span>🧾</span>
                    Compras
                </button>

                <button>
                    <span>💵</span>
                    Caja
                </button>

                <button onclick="mostrarPersonal()">
                    <span>👥</span>
                    Personal
                </button>

            </nav>

        </div>
    `;
}


/* ==========================================
   PERSONAL
   ========================================== */

function obtenerEmpleados() {

    const empleadosGuardados =
        localStorage.getItem("empleados_restaurante");

    if (!empleadosGuardados) {
        return [];
    }

    try {
        return JSON.parse(empleadosGuardados);
    } catch (error) {
        console.error(
            "No se pudieron leer los empleados:",
            error
        );

        return [];
    }
}


function guardarEmpleados(empleados) {

    localStorage.setItem(
        "empleados_restaurante",
        JSON.stringify(empleados)
    );
}


function mostrarPersonal() {

    const app = document.getElementById("app");

    const empleados = obtenerEmpleados();

    app.innerHTML = `

        <div class="sistema">

            <header class="topbar">

                <div class="marca">

                    <div class="marca-icono">
                        CR
                    </div>

                    <div>

                        <div class="marca-titulo">
                            Control Restaurante
                        </div>

                        <div class="marca-subtitulo">
                            Personal
                        </div>

                    </div>

                </div>


                <button
                    class="usuario-boton"
                    onclick="regresarDashboard()"
                >

                    <div class="usuario-avatar">
                        ${USUARIO_ACTUAL.nombre.charAt(0)}
                    </div>

                    <div class="usuario-info">

                        <strong>
                            ${USUARIO_ACTUAL.nombre}
                        </strong>

                        <span>
                            ${USUARIO_ACTUAL.rol}
                        </span>

                    </div>

                </button>

            </header>


            <main class="contenido">

                <section class="bienvenida">

                    <div>

                        <span class="etiqueta">
                            ADMINISTRACIÓN
                        </span>

                        <h1>
                            Personal
                        </h1>

                        <p>
                            Administra los empleados y su información básica.
                        </p>

                    </div>


                    <button
                        class="btn-agregar-personal"
                        onclick="mostrarFormularioEmpleado()"
                    >
                        + AGREGAR EMPLEADO
                    </button>

                </section>


                <section class="panel panel-personal">

                    <div class="panel-cabecera">

                        <div>

                            <span class="etiqueta">
                                PERSONAL REGISTRADO
                            </span>

                            <h2>
                                Empleados
                            </h2>

                        </div>

                        <span class="contador-alertas">
                            ${empleados.length}
                        </span>

                    </div>


                    <div id="listaEmpleados">

                        ${renderizarEmpleados(empleados)}

                    </div>

                </section>

            </main>


            <nav class="navegacion-movil">

                <button onclick="regresarDashboard()">
                    <span>⌂</span>
                    Inicio
                </button>

                <button>
                    <span>📦</span>
                    Inventario
                </button>

                <button>
                    <span>🧾</span>
                    Compras
                </button>

                <button>
                    <span>💵</span>
                    Caja
                </button>

                <button class="activo">
                    <span>👥</span>
                    Personal
                </button>

            </nav>

        </div>
    `;
}


/* ==========================================
   LISTA DE EMPLEADOS
   ========================================== */

function renderizarEmpleados(empleados) {

    if (empleados.length === 0) {

        return `
            <div class="personal-vacio">

                <div class="personal-vacio-icono">
                    👥
                </div>

                <h3>
                    Todavía no hay empleados registrados
                </h3>

                <p>
                    Agrega el primer empleado para comenzar
                    a construir el control de personal.
                </p>

                <button
                    class="btn-agregar-personal"
                    onclick="mostrarFormularioEmpleado()"
                >
                    + AGREGAR EMPLEADO
                </button>

            </div>
        `;
    }


    return empleados.map((empleado, indice) => {

        return `
            <div class="empleado-item">

                <div class="empleado-avatar">
                    ${obtenerIniciales(empleado.nombre)}
                </div>

                <div class="empleado-info">

                    <strong>
                        ${empleado.nombre}
                    </strong>

                    <span>
                        ${empleado.tipoContrato}
                    </span>

                    <small>
                        ${empleado.telefono || "Sin teléfono"}
                    </small>

                </div>

                <div class="empleado-estado">
                    <span class="estado-activo">
                        ${empleado.estado}
                    </span>
                </div>

                <button
                    class="empleado-eliminar"
                    onclick="eliminarEmpleado(${indice})"
                    title="Eliminar empleado"
                >
                    ×
                </button>

            </div>
        `;

    }).join("");
}


/* ==========================================
   FORMULARIO DE EMPLEADO
   ========================================== */

function mostrarFormularioEmpleado() {

    const app = document.getElementById("app");

    app.innerHTML = `

        <div class="sistema">

            <header class="topbar">

                <div class="marca">

                    <div class="marca-icono">
                        CR
                    </div>

                    <div>

                        <div class="marca-titulo">
                            Control Restaurante
                        </div>

                        <div class="marca-subtitulo">
                            Nuevo empleado
                        </div>

                    </div>

                </div>

            </header>


            <main class="contenido">

                <section class="bienvenida">

                    <div>

                        <span class="etiqueta">
                            PERSONAL
                        </span>

                        <h1>
                            Nuevo empleado
                        </h1>

                        <p>
                            Registra la información básica del empleado.
                        </p>

                    </div>

                </section>


                <section class="panel formulario-personal">

                    <form
                        onsubmit="guardarEmpleado(event)"
                    >

                        <div class="formulario-grid">


                            <div class="campo">

                                <label for="nombreEmpleado">
                                    Nombre completo
                                </label>

                                <input
                                    id="nombreEmpleado"
                                    type="text"
                                    placeholder="Ej. Juan Pérez"
                                    required
                                >

                            </div>


                            <div class="campo">

                                <label for="telefonoEmpleado">
                                    Teléfono
                                </label>

                                <input
                                    id="telefonoEmpleado"
                                    type="tel"
                                    placeholder="Ej. 322 123 4567"
                                >

                            </div>


                            <div class="campo campo-completo">

                                <label for="direccionEmpleado">
                                    Dirección
                                </label>

                                <input
                                    id="direccionEmpleado"
                                    type="text"
                                    placeholder="Calle, número, colonia, ciudad"
                                >

                            </div>


                            <div class="campo">

                                <label for="fechaIngreso">
                                    Fecha de ingreso
                                </label>

                                <input
                                    id="fechaIngreso"
                                    type="date"
                                    required
                                >

                            </div>


                            <div class="campo">

                                <label for="tipoContrato">
                                    Tipo de contratación
                                </label>

                                <select id="tipoContrato" required>

                                    <option value="">
                                        Seleccionar
                                    </option>

                                    <option value="Tiempo completo">
                                        Tiempo completo
                                    </option>

                                    <option value="Medio tiempo">
                                        Medio tiempo
                                    </option>

                                    <option value="Fines de semana">
                                        Fines de semana
                                    </option>

                                    <option value="Temporal">
                                        Temporal
                                    </option>

                                    <option value="Estacional">
                                        Estacional
                                    </option>

                                </select>

                            </div>


                            <div class="campo">

                                <label for="jornadaEmpleado">
                                    Jornada
                                </label>

                                <select id="jornadaEmpleado" required>

                                    <option value="">
                                        Seleccionar
                                    </option>

                                    <option value="Completa">
                                        Completa
                                    </option>

                                    <option value="Parcial">
                                        Parcial
                                    </option>

                                    <option value="Variable">
                                        Variable
                                    </option>

                                </select>

                            </div>


                            <div class="campo">

                                <label for="estadoEmpleado">
                                    Estado
                                </label>

                                <select id="estadoEmpleado" required>

                                    <option value="Activo">
                                        Activo
                                    </option>

                                    <option value="Inactivo">
                                        Inactivo
                                    </option>

                                </select>

                            </div>


                            <div class="campo campo-completo">

                                <label for="observacionesEmpleado">
                                    Observaciones
                                </label>

                                <textarea
                                    id="observacionesEmpleado"
                                    rows="4"
                                    placeholder="Información adicional..."
                                ></textarea>

                            </div>


                        </div>


                        <div class="acciones-formulario">

                            <button
                                type="button"
                                class="btn-secundario"
                                onclick="mostrarPersonal()"
                            >
                                CANCELAR
                            </button>

                            <button
                                type="submit"
                                class="btn-principal"
                            >
                                GUARDAR EMPLEADO
                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>
    `;
}


/* ==========================================
   GUARDAR EMPLEADO
   ========================================== */

function guardarEmpleado(event) {

    event.preventDefault();

    const empleado = {

        id:
            "EMP-" +
            Date.now(),

        nombre:
            document.getElementById(
                "nombreEmpleado"
            ).value.trim(),

        telefono:
            document.getElementById(
                "telefonoEmpleado"
            ).value.trim(),

        direccion:
            document.getElementById(
                "direccionEmpleado"
            ).value.trim(),

        fechaIngreso:
            document.getElementById(
                "fechaIngreso"
            ).value,

        tipoContrato:
            document.getElementById(
                "tipoContrato"
            ).value,

        jornada:
            document.getElementById(
                "jornadaEmpleado"
            ).value,

        estado:
            document.getElementById(
                "estadoEmpleado"
            ).value,

        observaciones:
            document.getElementById(
                "observacionesEmpleado"
            ).value.trim(),

        fechaRegistro:
            new Date().toISOString()

    };


    const empleados = obtenerEmpleados();

    empleados.push(empleado);

    guardarEmpleados(empleados);

    alert(
        "Empleado registrado correctamente."
    );

    mostrarPersonal();
}


/* ==========================================
   ELIMINAR EMPLEADO
   ========================================== */

function eliminarEmpleado(indice) {

    const empleados = obtenerEmpleados();

    const empleado = empleados[indice];

    if (!empleado) {
        return;
    }

    const confirmar = confirm(
        `¿Seguro que deseas eliminar a ${empleado.nombre}?`
    );

    if (!confirmar) {
        return;
    }

    empleados.splice(indice, 1);

    guardarEmpleados(empleados);

    mostrarPersonal();
}


/* ==========================================
   NAVEGACIÓN
   ========================================== */

function regresarDashboard() {

    const jornada = obtenerJornadaActual();

    if (!jornada) {
        mostrarPantallaJornada();
        return;
    }

    if (jornada.estado === "finalizada") {
        mostrarJornadaFinalizada(jornada);
        return;
    }

    mostrarDashboard(jornada);
}


/* ==========================================
   UTILIDADES
   ========================================== */

function obtenerIniciales(nombre) {

    if (!nombre) {
        return "?";
    }

    const palabras =
        nombre.trim().split(" ");

    if (palabras.length === 1) {
        return palabras[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        palabras[0].charAt(0) +
        palabras[1].charAt(0)
    ).toUpperCase();
}


function capturarTicket() {

    alert(
        "La cámara real será el siguiente paso.\n\n" +
        "Aquí capturaremos el ticket y posteriormente " +
        "lo enviaremos al proceso de lectura y validación."
    );
}


function cerrarSesion() {

    alert(
        "Sesión cerrada.\n\n" +
        "La jornada de hoy permanece registrada."
    );
}


function capitalizarPrimeraLetra(texto) {

    if (!texto) {
        return "";
    }

    return texto.charAt(0).toUpperCase() + texto.slice(1);
}
