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

const SUPABASE_URL = "https://drpdwccyjtetakcgbulf.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_mf390v5SbXC_xI9h95Q_hg_ElR7ngvZ";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
const CLAVE_JORNADA = "jornada_restaurante";
const CLAVE_EMPLEADOS = "empleados_restaurante";
const CLAVE_INVENTARIO = "inventario_restaurante";
const CLAVE_MOVIMIENTOS = "movimientos_inventario_restaurante";

/* =========================================================
   USUARIO ACTUAL - SUPABASE AUTH
========================================================= */

let USUARIO_ACTUAL = {
    id: null,
    nombre: "",
    rol: "",
    permisos: {},
    autenticado: false
};

/* =========================================================
   CONSULTAR USUARIO AUTENTICADO
========================================================= */

async function obtenerUsuarioAutenticado() {

    const { data: authData, error: authError } =
        await supabaseClient.auth.getUser();

    if (authError || !authData?.user) {
        return null;
    }

    const { data: perfil, error: perfilError } =
        await supabaseClient
            .from("cr_usuarios")
            .select("id, nombre, rol, activo, permisos")
            .eq("id", authData.user.id)
            .single();

    if (perfilError || !perfil || !perfil.activo) {

        console.error(
            "No se pudo validar el perfil:",
            perfilError
        );

        return null;
    }

    return {
        id: perfil.id,
        nombre: perfil.nombre,
        rol: perfil.rol,
        permisos: perfil.permisos || {},
        autenticado: true
    };
}

/* =========================================================
   PANTALLA DE INICIO DE SESIÓN
   SUPABASE AUTH
========================================================= */

function mostrarPantallaLogin() {

    const app = document.getElementById("app");

    app.innerHTML = `

        <main class="pantalla-jornada">

            <section class="jornada-card">

                <div class="jornada-icono">
                    🔐
                </div>

                <div class="jornada-etiqueta">
                    CONTROL RESTAURANTE
                </div>

                <h1>
                    Iniciar sesión
                </h1>

                <p class="jornada-info">
                    Ingresa con tu cuenta autorizada.
                </p>

                <form
                    id="formularioLogin"
                    onsubmit="iniciarSesionRestaurante(event)"
                    style="display:flex;flex-direction:column;gap:15px;margin-top:25px;"
                >

                    <input
                        type="email"
                        id="correoLogin"
                        placeholder="Correo electrónico"
                        autocomplete="username"
                        required
                        style="padding:14px;border-radius:10px;"
                    >

                    <input
                        type="password"
                        id="passwordLogin"
                        placeholder="Contraseña"
                        autocomplete="current-password"
                        required
                        style="padding:14px;border-radius:10px;"
                    >

                    <p
                        id="mensajeLogin"
                        role="alert"
                        style="color:#ff8b8b;font-size:13px;"
                    ></p>

                    <button
                        class="btn-jornada"
                        id="botonLogin"
                        type="submit"
                    >
                        ENTRAR AL SISTEMA
                    </button>

                </form>

            </section>

        </main>
    `;
}


/* =========================================================
   INICIAR SESIÓN CON SUPABASE
========================================================= */

async function iniciarSesionRestaurante(event) {

    event.preventDefault();

    const correo = document
        .getElementById("correoLogin")
        .value
        .trim();

    const password = document
        .getElementById("passwordLogin")
        .value;

    const mensaje = document.getElementById("mensajeLogin");
    const boton = document.getElementById("botonLogin");

    boton.disabled = true;
    boton.textContent = "VERIFICANDO...";

    mensaje.textContent = "";

    try {

        const { error } =
            await supabaseClient.auth.signInWithPassword({
                email: correo,
                password: password
            });

        if (error) {
            throw error;
        }

        const usuario = await obtenerUsuarioAutenticado();

        if (!usuario) {

            await supabaseClient.auth.signOut();

            throw new Error(
                "Tu cuenta no tiene autorización para acceder."
            );
        }

        USUARIO_ACTUAL = usuario;

        await iniciarAplicacion();

    } catch (error) {

        console.error("Error de acceso:", error);

               mensaje.textContent =
            error.message ||
            "No se pudo iniciar sesión.";

        boton.disabled = false;
        boton.textContent = "ENTRAR AL SISTEMA";
    }
}

/* =========================================================
   CERRAR SESIÓN - SUPABASE AUTH
========================================================= */

async function cerrarSesionRestaurante() {

    const confirmar = confirm(
        "¿Deseas cerrar tu sesión?"
    );

    if (!confirmar) {
        return;
    }

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {

        console.error(
            "Error al cerrar sesión:",
            error
        );

        alert(
            "No se pudo cerrar la sesión. Intenta nuevamente."
        );

        return;
    }

    USUARIO_ACTUAL = {
        id: null,
        nombre: "",
        rol: "",
        permisos: {},
        autenticado: false
    };

    mostrarPantallaLogin();
}

/* =========================================================
   INICIO DE LA APLICACIÓN
   ========================================================= */

async function iniciarAplicacion() {

    const app = document.getElementById("app");

    app.innerHTML = "<p style='padding:30px'>Cargando información...</p>";

       /* =========================================================
       VERIFICAR SESIÓN DE SUPABASE
    ========================================================= */

    const usuario = await obtenerUsuarioAutenticado();

    if (!usuario) {

        mostrarPantallaLogin();

        return;
    }

    USUARIO_ACTUAL = usuario;

    const { data, error } = await supabaseClient
        .from("cr_inventario")
        .select("*")
        .order("codigo", { ascending: true });

    if (error) {

        console.error("Error Supabase:", error);

        alert("No se pudo cargar el inventario de Supabase.");

    } else {

        window.inventarioSupabase = data;

        console.log("Inventario Supabase cargado:", data.length);

    }

    /* CARGAR PLATILLOS DESDE SUPABASE */

    try {

        await cargarProductosVentaSupabase();

    } catch (error) {

        console.error("Error al cargar platillos:", error);

        window.productosVentaSupabase = null;

    }

   /* =========================================================
   CARGAR RECETAS DESDE SUPABASE
========================================================= */

try {

    await cargarRecetasSupabase();

} catch (error) {

    console.error("Error al cargar recetas:", error);

    window.recetasSupabase = null;

}

/* =========================================================
   CARGAR VENTAS DESDE SUPABASE
========================================================= */

try {

    await cargarVentasSupabase();

} catch (error) {

    console.error("Error al cargar ventas:", error);

    window.ventasSupabase = null;

}   

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
    type="button"
    title="Cerrar sesión"
    onclick="cerrarSesionRestaurante()"> 

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


                ${(() => { const a=crAlertas(); const n=a.pendientes.length+a.vencidos.length; return n?`<section class="alerta-inventario"><div class="alerta-icono">⚠️</div><div><strong>Tickets y pagos pendientes</strong><span>${a.pendientes.length} ticket(s) por confirmar, ${a.atrasados.length} atrasado(s), ${a.vencidos.length} pago(s) vencido(s).</span></div><button type="button" onclick="mostrarTickets()">Revisar</button></section>`:''; })()}

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
    type="button"
    onclick="mostrarTickets()">

    <span>
        🧾
    </span>

    <span>
        Tickets
    </span>

</button>


                      
<button
    type="button"
    onclick="mostrarCorteCaja()">

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

/* =========================================================
   CARGAR EMPLEADOS DESDE SUPABASE
========================================================= */

async function cargarEmpleadosSupabase() {

    const { data, error } = await supabaseClient
        .from("cr_empleados")
        .select("*")
        .order("nombre", { ascending: true });

    if (error) {

        console.error(
            "Error al cargar empleados:",
            error
        );

        throw error;
    }

    window.empleadosSupabase = data || [];

    return window.empleadosSupabase;
}

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


async function mostrarPersonal() {

    const app =
        document.getElementById("app");

        let empleados = [];

    try {

        empleados = await cargarEmpleadosSupabase();

    } catch (error) {

        console.error(
            "No se pudo consultar el personal:",
            error
        );

        alert(
            "No se pudo cargar el personal desde Supabase."
        );

        return;
    }

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

async function mostrarFormularioEmpleado(
    id = null
) {

    const app =
        document.getElementById("app");

    let empleado = null;

    const editando =
        id !== null;

    if (editando) {

        try {

            const { data, error } =
                await supabaseClient
                    .from("cr_empleados")
                    .select("*")
                    .eq("id", id)
                    .single();

            if (error) {
                throw error;
            }

            empleado = data;

        } catch (error) {

            console.error(
                "Error al consultar empleado:",
                error
            );

            alert(
                "No se pudieron cargar los datos del empleado."
            );

            return;
        }
    }


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
   GUARDAR EMPLEADO EN SUPABASE
========================================================= */

async function guardarEmpleado(
    event,
    id = null
) {

    event.preventDefault();

    const nombre =
        document.getElementById(
            "nombreEmpleado"
        ).value.trim();

    const puesto =
        document.getElementById(
            "puestoEmpleado"
        ).value.trim();

    const telefono =
        document.getElementById(
            "telefonoEmpleado"
        ).value.trim();

    const estado =
        document.getElementById(
            "estadoEmpleado"
        ).value;

    const fechaIngreso =
        document.getElementById(
            "fechaIngresoEmpleado"
        ).value;

    const tipoJornada =
        document.getElementById(
            "tipoJornadaEmpleado"
        ).value;

    if (!nombre) {

        alert(
            "Escribe el nombre del empleado."
        );

        return;
    }

    const datosEmpleado = {

        nombre,
        puesto,
        telefono,
        estado,

        fechaIngreso:
            fechaIngreso || null,

        tipoJornada

    };

    try {

        let error;

        if (id !== null) {

            const resultado =
                await supabaseClient
                    .from("cr_empleados")
                    .update({

                        ...datosEmpleado,

                        fechaModificacion:
                            new Date().toISOString()

                    })
                    .eq("id", id)
                    .select("id")
                    .single();

            error = resultado.error;

        } else {

            const resultado =
                await supabaseClient
                    .from("cr_empleados")
                    .insert(datosEmpleado)
                    .select("id")
                    .single();

            error = resultado.error;
        }

        if (error) {
            throw error;
        }

        alert(
            id !== null
                ? "Empleado actualizado correctamente."
                : "Empleado registrado correctamente."
        );

        await mostrarPersonal();

    } catch (error) {

        console.error(
            "Error al guardar empleado:",
            error
        );

        alert(
            "No se pudo guardar el empleado en Supabase."
        );
    }
}



/* =========================================================
   ELIMINAR EMPLEADO DESDE SUPABASE
========================================================= */

async function eliminarEmpleado(
    id
) {

    try {

        const { data, error } =
            await supabaseClient
                .from("cr_empleados")
                .select("id, nombre")
                .eq("id", id)
                .single();

        if (error) {
            throw error;
        }

        const confirmar = confirm(
            `¿Deseas eliminar a ${data.nombre}?`
        );

        if (!confirmar) {
            return;
        }

        const resultado =
            await supabaseClient
                .from("cr_empleados")
                .delete()
                .eq("id", id)
                .select("id")
                .single();

        if (resultado.error) {
            throw resultado.error;
        }

        alert(
            "Empleado eliminado correctamente."
        );

        await mostrarPersonal();

    } catch (error) {

        console.error(
            "Error al eliminar empleado:",
            error
        );

        alert(
            "No se pudo eliminar el empleado de Supabase."
        );
    }
}



/* =========================================================
   INVENTARIO
   ========================================================= */

function obtenerInventario() {

    if (Array.isArray(window.inventarioSupabase)) {
        return window.inventarioSupabase;
    }

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


/* =========================================================
   GUARDAR PRODUCTO EN SUPABASE
   ========================================================= */

async function guardarProductoSupabase(producto) {

    const { error } = await supabaseClient
        .from("cr_inventario")
        .upsert({
            id: producto.id,
            codigo: producto.codigo,
            nombre: producto.nombre,
            categoria: producto.categoria,
            unidad: producto.unidad,
            existencia: Number(producto.existencia || 0),
            stockMinimo: Number(producto.stockMinimo || 0),
            costo: Number(producto.costo || 0),
            precio: Number(producto.precio || 0),
            estado: producto.estado || "Activo",
            fechaRegistro: producto.fechaRegistro || new Date().toISOString(),
            fechaModificacion: new Date().toISOString()
        }, { onConflict: "id" });

    if (error) {
        console.error("Error guardando producto:", error);
        throw error;
    }

    console.log("Producto guardado en Supabase:", producto.codigo);
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
   EXPORTAR RESPALDO DE INVENTARIO
========================================================= */

function exportarInventario() {

    const productos = obtenerInventario();

    if (!productos.length) {
        alert("No hay productos para exportar.");
        return;
    }

    const contenido = JSON.stringify(productos, null, 2);

    const archivo = new Blob(
        [contenido],
        { type: "application/json" }
    );

    const enlace = document.createElement("a");

    enlace.href = URL.createObjectURL(archivo);
    enlace.download = "respaldo-inventario.json";

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => {
        URL.revokeObjectURL(enlace.href);
    }, 1000);
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

                    <button
    class="btn-agregar-personal"
    type="button"
    onclick="exportarInventario()">
    EXPORTAR INVENTARIO
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

async function guardarProducto(
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


       try {

        await guardarProductoSupabase(nuevoProducto);

        productos.push(nuevoProducto);

        guardarInventario(productos);

        mostrarInventario();

   } catch (error) {

    console.error("ERROR REAL AL GUARDAR:", error);

    alert(
        "Error al guardar: " +
        (error.message || JSON.stringify(error))
    );

}
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

function obtenerProductosVenta() {

    return Array.isArray(window.productosVentaSupabase)
        ? window.productosVentaSupabase
        : JSON.parse(
            localStorage.getItem(CLAVE_PRODUCTOS_VENTA) || "[]"
        );

}
function guardarProductosVenta(productos){
    localStorage.setItem(
        CLAVE_PRODUCTOS_VENTA,
        JSON.stringify(productos)
    );
}

function obtenerRecetas(){

    return Array.isArray(window.recetasSupabase)
        ? window.recetasSupabase
        : JSON.parse(
            localStorage.getItem(CLAVE_RECETAS) || "[]"
        );

}

function guardarRecetas(recetas){
    localStorage.setItem(
        CLAVE_RECETAS,
        JSON.stringify(recetas)
    );
}

/* =========================================================
   CARGAR RECETAS DESDE SUPABASE
========================================================= */

async function cargarRecetasSupabase() {

    const { data, error } = await supabaseClient
        .from("cr_recetas")
        .select("*");

    if (error) {
        console.error("Error cargando recetas:", error);
        throw error;
    }

    window.recetasSupabase = data;

    console.log(
        "Recetas cargadas desde Supabase:",
        data.length
    );
}

/* =========================================================
   CARGAR PLATILLOS DESDE SUPABASE
========================================================= */

async function cargarProductosVentaSupabase() {

    const { data, error } = await supabaseClient
        .from("cr_productos_venta")
        .select("*")
        .order("nombre", { ascending: true });

    if (error) {
        console.error("Error cargando platillos:", error);
        throw error;
    }

    window.productosVentaSupabase = data;

    console.log(
        "Platillos cargados desde Supabase:",
        data.length
    );
}


/* =========================================================
   OBTENER VENTAS LOCALES Y DE SUPABASE
========================================================= */

function obtenerVentas(){

    let ventasLocales = [];

    try {

        ventasLocales = JSON.parse(
            localStorage.getItem(CLAVE_VENTAS) || "[]"
        );

        if(!Array.isArray(ventasLocales)){
            ventasLocales = [];
        }

    } catch(error) {

        console.error("Error leyendo ventas locales:", error);

    }

    if(!Array.isArray(window.ventasSupabase)){
        return ventasLocales;
    }

    const ventasUnificadas = new Map();

    for(const venta of ventasLocales){
        ventasUnificadas.set(String(venta.id), venta);
    }

    for(const venta of window.ventasSupabase){
        ventasUnificadas.set(String(venta.id), venta);
    }

    return [...ventasUnificadas.values()].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );

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
   CARGAR VENTAS DESDE SUPABASE
========================================================= */

async function cargarVentasSupabase(){

    const { data, error } = await supabaseClient
        .from("cr_ventas")
        .select("*")
        .order("fecha", { ascending: false });

    if(error){
        console.error("Error cargando ventas:", error);
        throw error;
    }

    window.ventasSupabase = data.map(venta => ({
        ...venta,
        metodoPago: venta.metodopago
    }));

    console.log(
        "Ventas cargadas desde Supabase:",
        window.ventasSupabase.length
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

        <div class="pantalla cr-ventas">
          <style>
            .cr-ventas .topbar p {color:#fff!important}
            .cr-ventas .card-header h2 {color:#17324b!important}
            .cr-ventas .grid-productos-venta {display:flex!important;flex-direction:column!important;gap:16px!important;width:100%!important}
            .cr-ventas .producto-venta {display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;text-align:left!important;padding:18px 20px!important;white-space:normal!important;overflow-wrap:anywhere!important;background:#f0f0f0!important;color:#19354e!important;border:1px solid #aaa!important;border-radius:3px!important}
            .cr-ventas .producto-venta > div {display:flex!important;flex-direction:column!important;align-items:flex-start!important;text-align:left!important;width:100%!important;gap:4px!important;margin:0 0 8px!important}
            .cr-ventas .producto-venta strong,.cr-ventas .producto-venta small {display:block!important;text-align:left!important;white-space:normal!important;color:inherit}
            .cr-ventas .producto-venta strong {font-size:17px!important}
            .cr-ventas .producto-venta small {font-size:14px!important;color:#526171!important}
          </style>
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
                                            Ingredientes según receta
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


                <section class="card" id="historialVentasRegistradas">
                    <div class="card-header"><div><h2>Ventas registradas</h2><p>Operaciones guardadas en este dispositivo.</p></div></div>
                    ${crHistorialVentasHTML()}
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

        <div class="pantalla cr-catalogo">

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


                    <style>
                    .cr-menu-cards{display:none}
                    .cr-catalogo .topbar p{color:#fff!important}
                    .cr-catalogo .card-header h2{color:#17324b!important}
                    @media(max-width:760px){
                      .cr-catalogo .tabla-contenedor{display:none!important}
                      .cr-menu-cards{display:flex;flex-direction:column;gap:12px;margin-top:16px}
                      .cr-menu-card{background:#f0f0f0;color:#19354e;border:1px solid #a6a6a6;border-radius:3px;padding:16px;text-align:left;min-width:0;overflow-wrap:anywhere}
                      .cr-menu-card strong{display:block;font-size:17px;margin-bottom:6px}
                      .cr-menu-card span{display:block;margin:5px 0}
                      .cr-menu-card .cr-precio{font-weight:700;font-size:18px}
                      .cr-menu-acciones{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
                      .cr-menu-acciones button{padding:9px 14px;min-width:95px}
                      .cr-catalogo .card-header{display:flex;flex-wrap:wrap;gap:10px}
                    }
                    </style>
                    <div class="cr-menu-cards">
                      ${productos.length ? productos.map(producto=>`<article class="cr-menu-card">
                         <strong>${crEsc(producto.nombre)}</strong>
                         <span>Código: ${crEsc(producto.codigo||'Sin código')}</span>
                         <span>Categoría: ${crEsc(producto.categoria||'-')}</span>
                         <span class="cr-precio">${crDinero(producto.precio)}</span>
                         <span>${producto.estado==='inactivo'?'Inactivo':'Activo'}</span>
                         <div class="cr-menu-acciones"><button type="button" onclick="editarProductoVenta('${producto.id}')">Editar</button><button type="button" onclick="eliminarCatalogoProductoVenta('${producto.id}')">Eliminar</button></div>
                      </article>`).join('') : '<p>No hay productos de venta.</p>'}
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

                            : [...inventario].sort((a,b) => {
                                const aUsado = ingredientes.some(i => String(i.productoId) === String(a.id));
                                const bUsado = ingredientes.some(i => String(i.productoId) === String(b.id));
                                return Number(bUsado) - Number(aUsado) || String(a.nombre).localeCompare(String(b.nombre), 'es');
                            }).map(item => {

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
   GUARDAR RECETA EN SUPABASE
========================================================= */

async function guardarFormularioReceta(event, productoId){

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

    const recetaExistente = recetas.find(
        r => String(r.productoId) === String(productoId)
    );

    const fechaActual = new Date().toISOString();

    const nuevaReceta = {

        id: recetaExistente
            ? String(recetaExistente.id)
            : String(Date.now()),

        productoId: Number(productoId),

        ingredientes: ingredientes,

        fechaRegistro: recetaExistente?.fechaRegistro || fechaActual,

        fechaModificacion: fechaActual

    };

    const boton = event.submitter;

    if(boton){
        boton.disabled = true;
    }

    try {

        const { error } = await supabaseClient
            .from("cr_recetas")
            .upsert(nuevaReceta, {
                onConflict: "id"
            });

        if(error){
            throw error;
        }

        const nuevasRecetas = recetas.filter(
            r => String(r.productoId) !== String(productoId)
        );

        nuevasRecetas.push(nuevaReceta);

        window.recetasSupabase = nuevasRecetas;

        guardarRecetas(nuevasRecetas);

        alert("Receta guardada correctamente.");

        mostrarRecetas();

    }catch(error){

        console.error(
            "Error guardando receta en Supabase:",
            error
        );

        alert(
            "No se pudo guardar la receta: " +
            (error.message || "Error desconocido")
        );

    }finally{

        if(boton){
            boton.disabled = false;
        }

    }

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

/* =========================================================
   GUARDAR PRODUCTO DE VENTA EN SUPABASE
========================================================= */

async function guardarProductoVenta(event, id = null){

    event.preventDefault();

    const productos = obtenerProductosVenta();

    const nombre = document
        .getElementById("nombreProductoVenta")
        .value.trim();

    const codigo = document
        .getElementById("codigoProductoVenta")
        .value.trim();

    const categoria = document
        .getElementById("categoriaProductoVenta")
        .value.trim();

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

    if(!Number.isFinite(precio) || precio < 0){
        alert("Ingresa un precio válido.");
        return;
    }

    const fechaActual = new Date().toISOString();

    let productoGuardar;

    if(id){

        const producto = productos.find(
            p => String(p.id) === String(id)
        );

        if(!producto){
            alert("Producto no encontrado.");
            return;
        }

        productoGuardar = {
            ...producto,
            codigo,
            nombre,
            categoria,
            precio,
            estado,
            fechaModificacion: fechaActual
        };

    }else{

        productoGuardar = {
            id: Date.now(),
            codigo,
            nombre,
            categoria,
            precio,
            estado,
            fechaRegistro: fechaActual,
            fechaModificacion: fechaActual
        };

    }

    const boton = event.submitter;

    if(boton){
        boton.disabled = true;
    }

    try {

        const { error } = await supabaseClient
            .from("cr_productos_venta")
            .upsert(productoGuardar, {
                onConflict: "id"
            });

        if(error){
            throw error;
        }

        const indice = productos.findIndex(
            p => String(p.id) === String(productoGuardar.id)
        );

        if(indice >= 0){

            productos[indice] = productoGuardar;

        }else{

            productos.push(productoGuardar);

        }

        guardarProductosVenta(productos);

        alert(
            id
            ? "Producto actualizado correctamente."
            : "Producto registrado correctamente."
        );

        mostrarProductosVenta();

    }catch(error){

        console.error(
            "Error guardando producto de venta:",
            error
        );

        alert(
            "No se pudo guardar en Supabase: " +
            (error.message || "Error desconocido")
        );

    }finally{

        if(boton){
            boton.disabled = false;
        }

    }

}

function editarProductoVenta(id){

    mostrarFormularioProductoVenta(id);
}


/* =========================================================
   ELIMINAR PRODUCTO DE VENTA EN SUPABASE
========================================================= */

async function eliminarCatalogoProductoVenta(id){

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

    try {

        const { data, error } = await supabaseClient
            .from("cr_productos_venta")
            .delete()
            .eq("id", producto.id)
            .select("id");

        if(error){
            throw error;
        }

        if(!data || data.length !== 1){
            throw new Error(
                "No se confirmó la eliminación en Supabase."
            );
        }

        const nuevosProductos = productos.filter(
            p => String(p.id) !== String(id)
        );

        window.productosVentaSupabase = nuevosProductos;

        guardarProductosVenta(nuevosProductos);

        mostrarProductosVenta();

        renderizarCarritoVenta();

        alert("Producto eliminado correctamente.");

    }catch(error){

        console.error(
            "Error eliminando producto de venta:",
            error
        );

        alert(
            "No se pudo eliminar el producto: " +
            (error.message || "Error desconocido")
        );

    }

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
   REGISTRAR VENTA CON DESCUENTO POR RECETA EN SUPABASE
========================================================= */

async function registrarVenta(){

    if(carritoVenta.length === 0){
        alert("Agrega al menos un producto a la venta.");
        return;
    }

    if(!cajaEstaAbierta()){
        alert("Debes abrir la caja antes de registrar ventas.");
        return;
    }

    const productosVenta = obtenerProductosVenta();
    const recetas = obtenerRecetas();

    // Copia independiente para no modificar el inventario
    // mostrado antes de que Supabase confirme la venta.
    const inventario = obtenerInventario().map(
        producto => ({ ...producto })
    );

    const consumos = new Map();
    const itemsVenta = [];

    let subtotal = 0;

    /* VALIDAR PLATILLOS Y RECETAS */

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
                    producto.nombre + " en Inventario."
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

    /* VALIDAR EXISTENCIAS */

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

    /* PREPARAR VENTA */

    const metodoPagoElement =
        document.getElementById("metodoPagoVenta");

    const metodoPago = metodoPagoElement
        ? metodoPagoElement.value
        : "Efectivo";

    const total = Number(subtotal.toFixed(2));
    const folio = generarFolioVenta();
    const fecha = new Date().toISOString();

    const usuario =
        typeof USUARIO_ACTUAL !== "undefined" && USUARIO_ACTUAL
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

    const consumosSupabase = [...consumos].map(
        ([productoId, cantidad]) => ({
            productoId: Number(productoId),
            cantidad: Number(cantidad.toFixed(6))
        })
    );

    /* REGISTRAR EN SUPABASE */

    let resultado;

    try{

        const { data, error } = await supabaseClient.rpc(
            "cr_registrar_venta",
            {
                p_venta: venta,
                p_consumos: consumosSupabase
            }
        );

        if(error){
            throw error;
        }

        if(!data || data.success !== true){
            throw new Error("Supabase no confirmó la venta.");
        }

        resultado = data;

    }catch(error){

        console.error("Error registrando venta en Supabase:", error);

        alert(
            "No se pudo confirmar la venta.\n\n" +
            (error.message || "Error desconocido") +
            "\n\nRevisa el historial antes de volver a intentarlo."
        );

        return;
    }

    /* SUPABASE CONFIRMÓ LA VENTA */

    // Conservar también una copia local, sin duplicar
    // las ventas anteriores de este dispositivo.
    try{

        const ventasLocales = obtenerVentas();

        if(!ventasLocales.some(
            v => String(v.id) === String(venta.id)
        )){
            ventasLocales.push(venta);
            guardarVentas(ventasLocales);
        }

    }catch(error){
        console.warn(
            "La venta se registró en Supabase, pero falló la copia local:",
            error
        );
    }

    // Recargar existencias reales desde Supabase.
    try{

        const { data, error } = await supabaseClient
            .from("cr_inventario")
            .select("*")
            .order("codigo", { ascending: true });

        if(error){
            throw error;
        }

        window.inventarioSupabase = data;

    }catch(error){
        console.error(
            "La venta se registró, pero no se pudo actualizar el inventario en pantalla:",
            error
        );
    }

    carritoVenta = [];

    alert(
        "Venta registrada correctamente.\n\n" +
        "Folio: " + resultado.folio + "\n" +
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
    const salidasEfectivo = crEgresosCaja(caja);

    const efectivoEsperado =
        fondoInicial +
        ventasEfectivo +
        entradasEfectivo -
        salidasEfectivo;

    const alertasTickets = crAlertas();
    if (alertasTickets.pendientes.length && !confirm(
        'Hay '+alertasTickets.pendientes.length+' ticket(s) pendientes de autorización, '+
        alertasTickets.atrasados.length+' de días anteriores.\n¿Continuar con el arqueo sin confirmarlos?'
    )) { mostrarTickets(); return; }

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


/* =========================================================
   TICKETS | CONTROL RESTAURANTE
   Documentos, OCR opcional, compras, créditos y alertas
   ========================================================= */
const CR_TICKETS_KEY = 'cr_tickets_v1';
const CR_TICKET_PAGOS_KEY = 'cr_ticket_pagos_v1';
const CR_TICKET_MOV_CAJA = 'cr_ticket_mov_caja_v1';
let crTicketFotoTemporal = null;
function crLeerLista(clave) { try { const a=JSON.parse(localStorage.getItem(clave)||'[]'); return Array.isArray(a)?a:[]; } catch(e){console.error(e);return [];} }
function crGuardarLista(clave,lista){localStorage.setItem(clave,JSON.stringify(lista));}
function crDinero(n){return '$'+Number(n||0).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2});}
function crEsc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function crTickets(){return crLeerLista(CR_TICKETS_KEY);}
function crPagos(){return crLeerLista(CR_TICKET_PAGOS_KEY);}
function crSaldo(t){return Math.max(0,Math.round((Number(t.total||0)-crPagos().filter(p=>p.ticketId===t.id).reduce((a,p)=>a+Number(p.importe),0))*100)/100);}
function crFechaLocal(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;}
function crAlertas(){const hoy=obtenerFechaActual(),lista=crTickets();return {pendientes:lista.filter(t=>t.estado==='Pendiente'),atrasados:lista.filter(t=>t.estado==='Pendiente'&&t.fecha<hoy),vencidos:lista.filter(t=>t.estado==='Confirmado'&&t.tipo==='Compra'&&crSaldo(t)>0&&t.vencimiento&&t.vencimiento<hoy),proximos:lista.filter(t=>t.estado==='Confirmado'&&t.tipo==='Compra'&&crSaldo(t)>0&&t.vencimiento&&t.vencimiento>=hoy&&t.vencimiento<=crFechaLocal(Date.now()+3*86400000))};}
function crDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open('cr_comprobantes',1);req.onupgradeneeded=()=>req.result.createObjectStore('fotos');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function crGuardarFoto(id,blob){const db=await crDb();return new Promise((resolve,reject)=>{const tx=db.transaction('fotos','readwrite');tx.objectStore('fotos').put(blob,id);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});}
async function crLeerFoto(id){const db=await crDb();return new Promise((resolve,reject)=>{const tx=db.transaction('fotos');const req=tx.objectStore('fotos').get(id);req.onsuccess=()=>{db.close();resolve(req.result||null);};req.onerror=()=>{db.close();reject(req.error);};});}
function crLayout(titulo,contenido){document.getElementById('app').innerHTML=`<div class="sistema"><header class="topbar"><div class="marca"><button class="texto-boton" type="button" onclick="regresarDashboard()">← Inicio</button><div class="marca-icono">CR</div><div><strong>${crEsc(titulo)}</strong><small>Administración</small></div></div></header><main class="contenido"><section class="bienvenida"><div><div class="etiqueta">CONTROL RESTAURANTE</div><h1>${crEsc(titulo)}</h1></div></section>${contenido}</main></div>`;}
function mostrarTickets(){
 const a=crAlertas(),tickets=crTickets().slice().reverse();
 crLayout('Tickets',`<section class="panel">
 <h2>Captura rápida de comprobantes</h2>
 <p>Fotografía varios tickets seguidos. Se guardan como pendientes inmediatamente; el lector procesa uno a la vez y completa los datos que pueda reconocer.</p>
 <label class="btn-principal" style="display:inline-block;cursor:pointer;padding:12px;margin:8px 0">📷 Fotografiar / seleccionar tickets
 <input type="file" accept="image/*" multiple onchange="crCapturarRapido(event)" style="position:absolute;opacity:0;width:1px;height:1px"></label>
 <button class="btn-secundario" type="button" onclick="crFormulario()">Captura manual</button>
 <button class="btn-secundario" type="button" onclick="crCuentas()">Cuentas por pagar</button>
 <p id="crColaEstado" role="status">${crColaOCR.length ? crColaOCR.length+' ticket(s) en cola' : 'Listo para capturar'}</p>
 </section><section class="indicadores"><article class="indicador"><div><span>PENDIENTES</span><strong>${a.pendientes.length}</strong></div></article><article class="indicador"><div><span>ATRASADOS</span><strong>${a.atrasados.length}</strong></div></article><article class="indicador"><div><span>PAGOS VENCIDOS</span><strong>${a.vencidos.length}</strong></div></article></section>
 <section class="panel"><div class="panel-cabecera"><h2>Comprobantes</h2></div><div id="crListaRapida">${crTicketsHTML()}</div></section>`);
}
function crTicketsHTML(){return crTickets().slice().reverse().map(t=>`<article class="empleado-item" style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div class="empleado-info"><strong>${crEsc(t.folio)} · ${crEsc(t.tipo)}</strong><span>${crEsc(t.proveedor||'Proveedor por identificar')} · ${crEsc(t.fecha||'Fecha por identificar')}</span><small>${Number(t.total)>0?crDinero(t.total):'Importe por identificar'} · ${crEsc(t.estado)} · ${crEsc(t.ocrEstado||'Pendiente de revisión')}</small></div><button class="btn-secundario" onclick="crDetalle('${t.id}')">Revisar</button></article>`).join('')||'<p>No hay tickets registrados.</p>';}
function crFormulario(id){const t=id?crTickets().find(x=>x.id===id):null;if(t&&t.estado!=='Pendiente'){alert('Solo se pueden editar tickets pendientes.');return;}const inv=obtenerInventario();crTicketFotoTemporal=null;crLayout(t?'Revisar ticket':'Capturar ticket',`<section class="panel"><form id="crForm" onsubmit="crGuardarTicket(event,'${id||''}')"><div class="formulario-grid"><div class="campo"><label>Tipo de documento</label><select id="crTipo" onchange="crActualizarTipo()"><option value="Compra" ${t?.tipo==='Compra'?'selected':''}>Compra a proveedor</option><option value="NotaVenta" ${t?.tipo==='NotaVenta'?'selected':''}>Nota de venta externa (solo evidencia)</option></select></div><div class="campo"><label>Proveedor / referencia</label><input id="crProveedor" required value="${crEsc(t?.proveedor||'')}"></div><div class="campo"><label>Fecha del documento</label><input id="crFecha" type="date" required value="${crEsc(t?.fecha||obtenerFechaActual())}"></div><div class="campo"><label>Importe total</label><input id="crTotal" type="number" min="0.01" step="0.01" required value="${t?.total??''}"></div><div class="campo"><label>Condición de pago</label><select id="crCondicion" onchange="crActualizarTipo()"><option value="Contado" ${t?.condicion==='Contado'?'selected':''}>Pagado de contado</option><option value="Credito" ${t?.condicion==='Credito'?'selected':''}>A crédito / por pagar</option></select></div><div class="campo"><label>Medio de pago (si es contado)</label><select id="crMetodo"><option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option></select></div><div class="campo"><label>Vencimiento (si es crédito)</label><input id="crVence" type="date" value="${crEsc(t?.vencimiento||'')}"></div><div class="campo"><label>Foto del comprobante (cámara o galería)</label><input id="crFoto" type="file" accept="image/*" capture="environment" onchange="crFotoSeleccionada(event)"></div></div><p id="crFotoEstado">${t?.foto?'Fotografía guardada anteriormente':'Sin fotografía'}</p><button type="button" class="btn-secundario" onclick="crOCR()">Leer foto (OCR, requiere internet)</button><div class="campo"><label>Texto leído / notas del comprobante</label><textarea id="crNotas" rows="4">${crEsc(t?.notas||'')}</textarea></div><div id="crLineasCompra"><h3>Ingredientes comprados (se suman SOLO al confirmar)</h3><div id="crLineas">${(t?.lineas?.length?t.lineas:[{}]).map(x=>crFilaInsumo(inv,x)).join('')}</div><button type="button" class="btn-secundario" onclick="crAgregarLinea()">+ Agregar ingrediente</button></div><div class="formulario-acciones"><button class="btn-secundario" type="button" onclick="mostrarTickets()">Cancelar</button><button class="btn-principal" type="submit">Guardar pendiente</button></div></form></section>`);crActualizarTipo();}
function crFilaInsumo(inv,x={}){return `<div class="cr-linea" style="display:flex;flex-wrap:wrap;gap:8px;margin:10px 0"><select class="cr-insumo" style="flex:2;min-width:150px"><option value="">Sin ingrediente / no aplica</option>${inv.map(p=>`<option value="${p.id}" ${String(x.productoId)===String(p.id)?'selected':''}>${crEsc(p.nombre)} (${crEsc(p.unidad)})</option>`).join('')}</select><input class="cr-cantidad" type="number" min="0.001" step="any" placeholder="Cantidad" style="flex:1;min-width:85px" value="${x.cantidad??''}"><input class="cr-costo" type="number" min="0" step="0.01" placeholder="Costo unitario" style="flex:1;min-width:85px" value="${x.costo??''}"><button type="button" onclick="this.closest('.cr-linea').remove()">×</button></div>`;}
function crAgregarLinea(){document.getElementById('crLineas').insertAdjacentHTML('beforeend',crFilaInsumo(obtenerInventario()));}
function crActualizarTipo(){const compra=document.getElementById('crTipo').value==='Compra';document.getElementById('crLineasCompra').style.display=compra?'':'none';document.getElementById('crVence').disabled=!compra||document.getElementById('crCondicion').value!=='Credito';}
function crFotoSeleccionada(e){crTicketFotoTemporal=e.target.files[0]||null;document.getElementById('crFotoEstado').textContent=crTicketFotoTemporal?'Foto seleccionada: '+crTicketFotoTemporal.name:'Sin fotografía';}
let crOCRWorker=null;
let crOCRWorkerPromise=null;
let crColaOCR=[];
let crProcesandoOCR=false;
async function crMotorOCR(){
 if(crOCRWorker)return crOCRWorker;
 if(!crOCRWorkerPromise)crOCRWorkerPromise=(async()=>{
  if(!window.Tesseract){await new Promise((ok,fail)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';script.onload=ok;script.onerror=()=>fail(new Error('No se pudo descargar el lector OCR. Revisa internet.'));document.head.appendChild(script);});}
  return Tesseract.createWorker('spa+eng',1,{logger:()=>{}});
 })().catch(e=>{crOCRWorkerPromise=null;throw e});
 crOCRWorker=await crOCRWorkerPromise;
 return crOCRWorker;
}
async function crImagenOptimizada(blob){
 try{
  const bitmap=await createImageBitmap(blob);
  const anchoMax=1500,escala=Math.min(1,anchoMax/bitmap.width);
  const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*escala);canvas.height=Math.round(bitmap.height*escala);
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const imagen=ctx.getImageData(0,0,canvas.width,canvas.height),d=imagen.data;
  for(let i=0;i<d.length;i+=4){let g=Math.min(255,Math.max(0,(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]-115)*1.35+135));d[i]=d[i+1]=d[i+2]=g;}
  ctx.putImageData(imagen,0,0);
  return await new Promise(resolve=>canvas.toBlob(b=>resolve(b||blob),'image/jpeg',0.86));
 }catch(e){console.warn('No se pudo optimizar foto',e);return blob;}
}
function crExtraerDatosOCR(texto, confianza=0){
 const lineas=String(texto||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 let fecha='';
 const m=String(texto||'').match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/);
 if(m){let a=+m[1],b=+m[2],y=+m[3];if(y<100)y+=2000;if(a>=1&&a<=31&&b>=1&&b<=12&&y>=2020&&y<=2100){const d=new Date(y,b-1,a);if(d.getFullYear()===y&&d.getMonth()===b-1&&d.getDate()===a)fecha=`${y}-${String(b).padStart(2,'0')}-${String(a).padStart(2,'0')}`;}}
 const montos=[];
 for(const l of lineas){if(/\b(total|importe\s+total|a\s+pagar|neto\s+a\s+pagar)\b/i.test(l)&&!/subtotal|sub.total|total\s+art/i.test(l)){const match=l.match(/\$?\s*(\d{1,6}(?:,\d{3})*(?:\.\d{2})|\d{1,6}[,.]\d{2})\b/g)||[];for(const x of match){const n=Number(x.replace(/[$\s]/g,'').replace(/,(?=\d{3}(?:\.|$))/g,'').replace(',','.'));if(Number.isFinite(n)&&n>0)montos.push(n);}}}
 const total=montos.length?montos[montos.length-1]:null;
 // No convertir ruido del OCR en un proveedor ficticio.
 const proveedor=(confianza>=45?lineas.find(x=>{const palabras=x.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{3,}/g)||[];return palabras.length>=2&&/^[\p{L}\d &.,'()/-]+$/u.test(x)&&!/ticket|fecha|total|rfc|folio|cliente|factura|gracias|efectivo/i.test(x);})||'':'').slice(0,100);
 return {proveedor,fecha:confianza>=35?fecha:'',total:confianza>=45?total:null};
}
let crUltimaConfianzaOCR=0;
async function crLeerTexto(blob){const motor=await crMotorOCR();const foto=await crImagenOptimizada(blob);const r=await motor.recognize(foto);crUltimaConfianzaOCR=Number(r.data.confidence||0);return r.data.text||'';}
async function crOCR(){const archivo=crTicketFotoTemporal;if(!archivo){alert('Selecciona primero una fotografía nueva.');return;}const estado=document.getElementById('crFotoEstado');estado.textContent='Leyendo fotografía...';try{const texto=await crLeerTexto(archivo);const datos=crExtraerDatosOCR(texto,crUltimaConfianzaOCR);document.getElementById('crNotas').value=texto;if(datos.proveedor)document.getElementById('crProveedor').value=datos.proveedor;if(datos.fecha)document.getElementById('crFecha').value=datos.fecha;if(datos.total)document.getElementById('crTotal').value=datos.total;estado.textContent='Lectura terminada. Los datos detectados son aproximados: revisa antes de confirmar.';}catch(e){console.error(e);estado.textContent='No se pudo leer: '+e.message+'. Puedes guardar la fotografía pendiente.';}}
async function crCapturarRapido(event){
 const archivos=[...(event.target.files||[])];event.target.value='';if(!archivos.length)return;
 const lista=crTickets();let guardados=0;
 for(const foto of archivos){
  if(!foto.type.startsWith('image/'))continue;
  const id='CR'+Date.now()+'-'+Math.random().toString(36).slice(2,9);
  try{
   await crGuardarFoto(id,foto);
   lista.push({id,folio:'COM-'+id.slice(-9),tipo:'Compra',proveedor:'',fecha:'',total:null,condicion:'Contado',metodo:'Efectivo',vencimiento:'',notas:'',lineas:[],estado:'Pendiente',ocrEstado:'En cola de lectura',foto:true,creado:new Date().toISOString(),usuario:USUARIO_ACTUAL.nombre});
   crGuardarLista(CR_TICKETS_KEY,lista);
   crColaOCR.push(id);guardados++;
  }catch(e){console.error(e);alert('No se pudo guardar una fotografía. Revisa el espacio disponible.');}
 }
 if(guardados){mostrarTickets();crProcesarColaOCR();}
}
async function crProcesarColaOCR(){
 if(crProcesandoOCR)return;crProcesandoOCR=true;
 try{while(crColaOCR.length){
  const id=crColaOCR.shift();const lista=crTickets();const t=lista.find(x=>x.id===id);if(!t||t.estado!=='Pendiente')continue;
  t.ocrEstado='Leyendo...';crGuardarLista(CR_TICKETS_KEY,lista);crRefrescarListaOCR();
  try{const foto=await crLeerFoto(id);if(!foto)throw Error('No se encontró la fotografía');const texto=await crLeerTexto(foto);const datos=crExtraerDatosOCR(texto,crUltimaConfianzaOCR);const nueva=crTickets();const actual=nueva.find(x=>x.id===id);if(actual&&actual.estado==='Pendiente'){
   actual.notas=texto;actual.proveedor=datos.proveedor;actual.fecha=datos.fecha;actual.total=datos.total;actual.ocrEstado=texto.trim()?'Leído, revisar datos':'No se reconoció texto';actual.ocrProcesadoEn=new Date().toISOString();crGuardarLista(CR_TICKETS_KEY,nueva);
  }}catch(e){console.error(e);const nueva=crTickets();const actual=nueva.find(x=>x.id===id);if(actual){actual.ocrEstado='Lectura pendiente: '+String(e.message||e).slice(0,100);crGuardarLista(CR_TICKETS_KEY,nueva);}}
  crRefrescarListaOCR();
 }}finally{crProcesandoOCR=false;crRefrescarListaOCR();}
}
function crRefrescarListaOCR(){const lista=document.getElementById('crListaRapida');if(lista)lista.innerHTML=crTicketsHTML();const estado=document.getElementById('crColaEstado');if(estado)estado.textContent=crProcesandoOCR?`Procesando tickets. En cola: ${crColaOCR.length}`:'Listo para capturar';}
async function crGuardarTicket(event,id){event.preventDefault();const form=document.getElementById('crForm'),tipo=document.getElementById('crTipo').value,condicion=document.getElementById('crCondicion').value,total=Number(document.getElementById('crTotal').value),vencimiento=document.getElementById('crVence').value;const lineas=tipo==='Compra'?[...form.querySelectorAll('.cr-linea')].map(el=>({productoId:el.querySelector('.cr-insumo').value,cantidad:Number(el.querySelector('.cr-cantidad').value),costo:Number(el.querySelector('.cr-costo').value)})).filter(x=>x.productoId):[];if(tipo==='Compra'&&condicion==='Credito'&&!vencimiento){alert('Indica la fecha de vencimiento del crédito.');return;}if(lineas.some(x=>!Number.isFinite(x.cantidad)||x.cantidad<=0)){alert('Revisa las cantidades de los ingredientes.');return;}const lista=crTickets(),actual=id?lista.find(x=>x.id===id):null;if(id&&!actual)return;const ticket={...(actual||{}),id:id||'CR'+Date.now()+'-'+Math.floor(Math.random()*10000),folio:actual?.folio||'COM-'+String(Date.now()).slice(-9),tipo,proveedor:document.getElementById('crProveedor').value.trim(),fecha:document.getElementById('crFecha').value,total,condicion,metodo:document.getElementById('crMetodo').value,vencimiento:tipo==='Compra'&&condicion==='Credito'?vencimiento:'',notas:document.getElementById('crNotas').value,lineas,estado:'Pendiente',foto:Boolean(actual?.foto||crTicketFotoTemporal),creado:actual?.creado||new Date().toISOString(),usuario:actual?.usuario||USUARIO_ACTUAL.nombre};try{if(crTicketFotoTemporal)await crGuardarFoto(ticket.id,crTicketFotoTemporal);if(actual)lista[lista.indexOf(actual)]=ticket;else lista.push(ticket);crGuardarLista(CR_TICKETS_KEY,lista);mostrarTickets();}catch(e){console.error(e);alert('No se guardó el ticket. Revisa el espacio disponible y vuelve a intentar.');}}
async function crVerFoto(id){try{const blob=await crLeerFoto(id);if(!blob){alert('Este ticket no tiene fotografía almacenada en este dispositivo.');return;}const url=URL.createObjectURL(blob);const w=window.open(url,'_blank');if(!w){alert('Permite ventanas emergentes para visualizar la foto.');URL.revokeObjectURL(url);}else setTimeout(()=>URL.revokeObjectURL(url),120000);}catch(e){alert('No se pudo abrir la fotografía.');}}
function crDetalle(id){const t=crTickets().find(x=>x.id===id);if(!t)return mostrarTickets();const pagos=crPagos().filter(p=>p.ticketId===id);crLayout('Ticket '+t.folio,`<section class="panel"><p><strong>Tipo:</strong> ${crEsc(t.tipo)} · <strong>Estado:</strong> ${crEsc(t.estado)}</p><p><strong>Proveedor:</strong> ${crEsc(t.proveedor||"Pendiente de identificar")}</p><p><strong>Fecha:</strong> ${crEsc(t.fecha||"Pendiente de identificar")} · <strong>Total:</strong> ${Number(t.total)>0?crDinero(t.total):"Pendiente de identificar"}</p><p><strong>Pago:</strong> ${crEsc(t.condicion)} · ${crEsc(t.metodo)} · <strong>Saldo:</strong> ${crDinero(crSaldo(t))}</p>${t.vencimiento?`<p><strong>Vence:</strong> ${crEsc(t.vencimiento)}</p>`:''}<p><strong>Notas:</strong> ${crEsc(t.notas)}</p>${t.lineas?.length?`<h3>Insumos</h3>${t.lineas.map(l=>{const p=obtenerInventario().find(x=>String(x.id)===String(l.productoId));return `<p>${crEsc(p?.nombre||'Producto no encontrado')}: ${l.cantidad} ${crEsc(p?.unidad||'')} × ${crDinero(l.costo)}</p>`;}).join('')}`:''}${t.foto?`<button class="btn-secundario" onclick="crVerFoto('${t.id}')">Ver fotografía</button>`:''}<p>${t.estado==='Pendiente'?`<button class="btn-secundario" onclick="crFormulario('${t.id}')">Editar</button> <button class="btn-principal" onclick="crConfirmar('${t.id}')">Confirmar y aplicar</button> <button class="btn-secundario" onclick="crRechazar('${t.id}')">Rechazar</button>`:''}</p>${t.estado==='Confirmado'&&t.tipo==='Compra'&&crSaldo(t)>0?`<button class="btn-principal" onclick="crRegistrarPago('${t.id}')">Registrar pago / abono</button>`:''}<h3>Pagos registrados</h3>${pagos.map(p=>`<p>${crEsc(p.fecha.slice(0,10))} · ${crDinero(p.importe)} · ${crEsc(p.metodo)}</p>`).join('')||'<p>Sin pagos.</p>'}<button class="btn-secundario" onclick="mostrarTickets()">Volver</button></section>`);}
function crRechazar(id){if(!['Administrador','Encargada'].includes(USUARIO_ACTUAL.rol))return alert('No autorizado.');if(!confirm('¿Rechazar este comprobante?'))return;const a=crTickets(),t=a.find(x=>x.id===id);if(!t||t.estado!=='Pendiente')return;t.estado='Rechazado';t.autorizadoPor=USUARIO_ACTUAL.nombre;t.autorizadoEn=new Date().toISOString();crGuardarLista(CR_TICKETS_KEY,a);mostrarTickets();}
function crConfirmar(id){if(!['Administrador','Encargada'].includes(USUARIO_ACTUAL.rol))return alert('Solo encargada o administrador pueden autorizar.');const lista=crTickets(),t=lista.find(x=>x.id===id);if(!t||t.estado!=='Pendiente')return;if(!t.proveedor||!t.fecha||!Number.isFinite(Number(t.total))||Number(t.total)<=0){alert('Antes de confirmar, revisa proveedor, fecha y total en Editar.');return;}const inv=obtenerInventario(),mov=obtenerMovimientosInventario();if(t.tipo==='Compra'){for(const l of t.lineas){const p=inv.find(x=>String(x.id)===String(l.productoId));if(!p)return alert('Un ingrediente ya no existe. Edita el ticket antes de confirmar.');}if(t.condicion==='Contado'&&t.metodo==='Efectivo'&&!cajaEstaAbierta())return alert('Abre caja antes de confirmar una compra pagada en efectivo.');}if(!confirm('¿Confirmar '+t.folio+'?\n\nLa compra ingresará ingredientes al inventario y registrará su pago o deuda.\nLas notas de venta externa solo se archivan: no duplican ventas.'))return;try{if(t.tipo==='Compra'){for(const l of t.lineas){const p=inv.find(x=>String(x.id)===String(l.productoId)),antes=Number(p.existencia||0),despues=Number((antes+Number(l.cantidad)).toFixed(6));p.existencia=despues;mov.push({id:Date.now()+Math.random(),productoId:p.id,productoNombre:p.nombre,tipo:'Entrada',cantidad:Number(l.cantidad),unidad:p.unidad||'',existenciaAnterior:antes,existenciaNueva:despues,motivo:'Compra ticket '+t.folio,ticketId:t.id,usuario:USUARIO_ACTUAL.nombre,fecha:new Date().toISOString()});}if(t.condicion==='Contado'){const pago={id:'P'+Date.now(),ticketId:t.id,importe:Number(t.total),metodo:t.metodo,fecha:new Date().toISOString(),usuario:USUARIO_ACTUAL.nombre};const pagos=crPagos();pagos.push(pago);crGuardarLista(CR_TICKET_PAGOS_KEY,pagos);if(t.metodo==='Efectivo')crAgregarMovimientoCaja(pago);}}t.estado='Confirmado';t.autorizadoPor=USUARIO_ACTUAL.nombre;t.autorizadoEn=new Date().toISOString();crGuardarLista(CR_TICKETS_KEY,lista);if(t.tipo==='Compra'){guardarInventario(inv);guardarMovimientosInventario(mov);}crDetalle(id);}catch(e){console.error(e);alert('Ocurrió un error guardando la confirmación. No repitas la operación sin revisar el historial.');}}
function crAgregarMovimientoCaja(pago){const caja=obtenerCajaActual();if(!caja||caja.estado!=='Abierta')throw Error('Caja cerrada');const a=crLeerLista(CR_TICKET_MOV_CAJA);if(a.some(x=>x.pagoId===pago.id))return;a.push({pagoId:pago.id,cajaId:caja.id,importe:pago.importe,fecha:pago.fecha,ticketId:pago.ticketId});crGuardarLista(CR_TICKET_MOV_CAJA,a);}
function crEgresosCaja(caja){return crLeerLista(CR_TICKET_MOV_CAJA).filter(m=>String(m.cajaId)===String(caja?.id)).reduce((a,m)=>a+Number(m.importe||0),0);}
function crRegistrarPago(id){if(!['Administrador','Encargada'].includes(USUARIO_ACTUAL.rol))return alert('No autorizado.');const t=crTickets().find(x=>x.id===id);if(!t||t.estado!=='Confirmado'||t.tipo!=='Compra')return;const saldo=crSaldo(t);if(saldo<=0)return alert('Ya está liquidado.');const s=prompt('Saldo: '+crDinero(saldo)+'\n¿Cuánto deseas abonar?',saldo.toFixed(2));if(s===null)return;const importe=Number(s.replace(',','.'));if(!Number.isFinite(importe)||importe<=0||importe>saldo)return alert('Abono inválido.');const metodo=prompt('Método: Efectivo, Transferencia o Tarjeta','Transferencia');if(metodo===null)return;const m=metodo.trim().toLowerCase(),normalizado=m==='efectivo'?'Efectivo':m==='transferencia'?'Transferencia':m==='tarjeta'?'Tarjeta':null;if(!normalizado)return alert('Método no válido.');if(normalizado==='Efectivo'&&!cajaEstaAbierta())return alert('Abre caja antes de registrar el pago en efectivo.');if(!confirm('Registrar abono de '+crDinero(importe)+' por '+normalizado+' a '+t.folio+'?'))return;const pago={id:'P'+Date.now()+'-'+Math.random(),ticketId:id,importe,metodo:normalizado,fecha:new Date().toISOString(),usuario:USUARIO_ACTUAL.nombre};try{const a=crPagos();a.push(pago);crGuardarLista(CR_TICKET_PAGOS_KEY,a);if(normalizado==='Efectivo')crAgregarMovimientoCaja(pago);crDetalle(id);}catch(e){console.error(e);alert('No se pudo registrar el pago. Revisa el historial antes de reintentar.');}}
function crCuentas(){const t=crTickets().filter(x=>x.estado==='Confirmado'&&x.tipo==='Compra'&&crSaldo(x)>0),total=t.reduce((a,x)=>a+crSaldo(x),0);crLayout('Cuentas por pagar',`<section class="panel"><h2>Saldo total: ${crDinero(total)}</h2><p>Compras confirmadas aún no liquidadas.</p>${t.map(x=>`<article class="empleado-item"><div class="empleado-info"><strong>${crEsc(x.proveedor)} · ${crEsc(x.folio)}</strong><span>Saldo ${crDinero(crSaldo(x))} · Vence ${crEsc(x.vencimiento||'Sin fecha')}</span></div><button class="btn-secundario" onclick="crDetalle('${x.id}')">Ver / abonar</button></article>`).join('')||'<p>No hay cuentas pendientes.</p>'}<button class="btn-secundario" onclick="mostrarTickets()">Volver</button></section>`);}

/* =========================================================
   AJUSTES DE PRUEBA: HISTORIAL, CONTRASTE Y ATRÁS EN MÓVIL
   No altera la estructura ni el diseño general.
   ========================================================= */

function crHistorialVentasHTML() {
    const ventas = obtenerVentas().filter(v => v.estado === "Completada")
        .sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 30);
    if (!ventas.length) return '<p>Aún no hay ventas registradas.</p>';
    return `<div style="overflow-x:auto"><table style="width:100%;min-width:460px;text-align:left;border-collapse:collapse">
        <thead><tr><th>Folio</th><th>Fecha</th><th>Platillos</th><th>Pago</th><th>Total</th></tr></thead>
        <tbody>${ventas.map(v => `<tr>
            <td style="padding:9px 5px">${crEscVenta(v.folio)}</td>
            <td style="padding:9px 5px">${new Date(v.fecha).toLocaleString('es-MX')}</td>
            <td style="padding:9px 5px">${(v.items||[]).map(i => `${crEscVenta(i.nombre)} × ${Number(i.cantidad)||0}`).join(', ')}</td>
            <td style="padding:9px 5px">${crEscVenta(v.metodoPago)}</td>
            <td style="padding:9px 5px">$${Number(v.total||0).toFixed(2)}</td>
        </tr>`).join('')}</tbody></table></div>`;
}
function crEscVenta(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

(function crPrepararNavegacion() {
    // Historial de pantallas de esta SPA: el botón Atrás vuelve a la pantalla previa.
    const pantallas = [
        'mostrarDashboard', 'mostrarPersonal', 'mostrarFormularioEmpleado',
        'mostrarInventario', 'mostrarTablaExistencias', 'mostrarFormularioProducto',
        'mostrarProductosVenta', 'mostrarFormularioProductoVenta',
        'mostrarRecetas', 'mostrarFormularioReceta', 'mostrarVentas',
        'mostrarCorteCaja', 'mostrarTickets', 'mostrarPantallaJornada'
    ];
    const originales = {};
    let restaurando = false;
    for (const nombre of pantallas) {
        if (typeof window[nombre] !== 'function') continue;
        originales[nombre] = window[nombre];
        window[nombre] = function(...args) {
            const resultado = originales[nombre].apply(this, args);
            if (!restaurando && document.getElementById('app')) {
                const estado = {crPantalla:nombre, crArgs:args.map(a =>
                    a && typeof a === 'object' ? null : a)};
                if (!history.state || history.state.crPantalla !== nombre ||
                    JSON.stringify(history.state.crArgs) !== JSON.stringify(estado.crArgs)) {
                    history.pushState(estado, '', location.href);
                }
            }
            return resultado;
        };
    }
    window.addEventListener('popstate', function(event) {
        const estado = event.state;
        restaurando = true;
        try {
            if (estado && originales[estado.crPantalla]) {
                originales[estado.crPantalla](...(estado.crArgs || []));
            } else if (typeof originales.mostrarDashboard === 'function') {
                originales.mostrarDashboard(obtenerJornadaActual());
            }
        } finally { restaurando = false; }
    });
    document.addEventListener('DOMContentLoaded', () => {
        if (!history.state || !history.state.crPantalla) {
            history.replaceState({crPantalla:'mostrarDashboard',crArgs:[null]}, '', location.href);
        }
        const estilos = document.createElement('style');
        estilos.id = 'cr-contraste-titulos';
        estilos.textContent = `
            .pantalla > .topbar h1, .pantalla .card-header h2,
            .pantalla .card > h3, .pantalla .mensaje-vacio h3 {
                color: #fff !important;
            }
        `;
        if (!document.getElementById(estilos.id)) document.head.appendChild(estilos);
    });
})();

/* =========================================================
   PERMISOS DE EMPLEADOS — SOLO PROPIETARIO
========================================================= */

const CR_OPCIONES_PERMISOS = [
    ["menu_ver", "Consultar menú"],
    ["menu_agregar", "Agregar platillos"],
    ["menu_editar", "Editar platillos, precios y fotos"],
    ["menu_eliminar", "Eliminar platillos"],
    ["recetas_ver", "Consultar recetas"],
    ["recetas_editar", "Modificar recetas"],
    ["inventario_ver", "Consultar inventario"],
    ["inventario_movimientos", "Registrar movimientos de inventario"],
    ["tickets_capturar", "Capturar tickets"],
    ["tickets_revisar", "Revisar tickets"],
    ["tickets_autorizar", "Autorizar tickets"],
    ["ventas_ver", "Consultar ventas"],
    ["ventas_cobrar", "Registrar y cobrar ventas"],
    ["caja_ver", "Consultar caja"],
    ["caja_abrir", "Abrir caja"],
    ["caja_cortar", "Realizar cortes de caja"],
    ["personal_ver", "Consultar personal"],
    ["personal_editar", "Agregar y editar empleados"],
    ["reportes_ver", "Consultar reportes"],
    ["reportes_exportar", "Exportar reportes"]
];

(function agregarPermisosAlFormulario() {

    const formularioOriginal =
        window.mostrarFormularioEmpleado;

    window.mostrarFormularioEmpleado =
        async function (...argumentos) {

            await formularioOriginal.apply(
                this,
                argumentos
            );

            const rolActual =
                String(USUARIO_ACTUAL.rol || "")
                    .trim()
                    .toLowerCase();

            if (rolActual !== "propietario") return;

            const formulario =
                document.querySelector(
                    "#app .formulario-personal"
                );

            if (!formulario) return;

            if (
                document.getElementById(
                    "crPanelPermisosEmpleado"
                )
            ) return;

            const empleadoId =
                argumentos[0] ?? null;

            const panel =
                document.createElement("section");

            panel.id = "crPanelPermisosEmpleado";
            panel.className = "panel";

            const titulo =
                document.createElement("h3");

            titulo.textContent =
                "Cuenta y permisos de acceso";

            panel.appendChild(titulo);

            const mensaje =
                document.createElement("p");

            mensaje.setAttribute("role", "status");
            panel.appendChild(mensaje);

            const acciones =
                formulario.querySelector(
                    ".formulario-acciones"
                );

            formulario.insertBefore(
                panel,
                acciones
            );

            if (empleadoId === null) {

                mensaje.textContent =
                    "Primero guarda al empleado. Después abre " +
                    "Editar para vincular su cuenta y asignar permisos.";

                return;
            }

            mensaje.textContent =
                "Consultando cuentas...";

            try {

                const [
                    resultadoCuentas,
                    resultadoEmpleado
                ] = await Promise.all([

                    supabaseClient.rpc(
                        "cr_listar_cuentas_personal"
                    ),

                    supabaseClient
                        .from("cr_empleados")
                        .select("usuario_id")
                        .eq("id", empleadoId)
                        .single()

                ]);

                if (resultadoCuentas.error) {
                    throw resultadoCuentas.error;
                }

                if (resultadoEmpleado.error) {
                    throw resultadoEmpleado.error;
                }

                if (!panel.isConnected) return;

                const cuentas =
                    resultadoCuentas.data || [];

                const etiquetaCuenta =
                    document.createElement("label");

                etiquetaCuenta.className = "campo";

                const textoCuenta =
                    document.createElement("span");

                textoCuenta.textContent =
                    "Cuenta del empleado";

                const selector =
                    document.createElement("select");

                const opcionInicial =
                    document.createElement("option");

                opcionInicial.value = "";
                opcionInicial.textContent =
                    "Selecciona una cuenta existente";

                selector.appendChild(opcionInicial);

                cuentas.forEach(cuenta => {

                    const opcion =
                        document.createElement("option");

                    opcion.value = cuenta.id;

                    opcion.textContent =
                        `${cuenta.nombre || "Sin nombre"} — ` +
                        `${cuenta.correo || ""}` +
                        (cuenta.activo ? "" : " — Inactiva");

                    selector.appendChild(opcion);

                });

                selector.value =
                    resultadoEmpleado.data.usuario_id || "";

                etiquetaCuenta.append(
                    textoCuenta,
                    selector
                );

                panel.appendChild(etiquetaCuenta);

                const lista =
                    document.createElement("div");

                lista.className = "formulario-grid";

                const casillas = [];

                CR_OPCIONES_PERMISOS.forEach(
                    ([clave, descripcion]) => {

                        const etiqueta =
                            document.createElement("label");

                        const casilla =
                            document.createElement("input");

                        casilla.type = "checkbox";

                        etiqueta.append(
                            casilla,
                            document.createTextNode(
                                " " + descripcion
                            )
                        );

                        lista.appendChild(etiqueta);

                        casillas.push({
                            clave,
                            casilla
                        });

                    }
                );

                panel.appendChild(lista);

                const boton =
                    document.createElement("button");

                boton.type = "button";
                boton.className = "btn-principal";
                boton.textContent =
                    "Guardar cuenta y permisos";

                panel.appendChild(boton);

                function cargarPermisosSeleccionados() {

                    const cuenta =
                        cuentas.find(
                            item => item.id === selector.value
                        );

                    const esPropietario =
                        String(cuenta?.rol || "")
                            .trim()
                            .toLowerCase() === "propietario";

                    casillas.forEach(
                        ({ clave, casilla }) => {

                            casilla.checked =
                                esPropietario ||
                                cuenta?.permisos?.[clave] === true;

                            casilla.disabled =
                                !cuenta || esPropietario;

                        }
                    );

                    boton.disabled = !cuenta;

                    mensaje.textContent =
                        esPropietario
                            ? "El propietario tiene acceso total."
                            : cuenta
                                ? "Selecciona los permisos y pulsa " +
                                  "Guardar cuenta y permisos. " +
                                  "Esto no cambia el estado de la cuenta."
                                : "Selecciona la cuenta que usará " +
                                  "este empleado para iniciar sesión.";

                }

                selector.addEventListener(
                    "change",
                    cargarPermisosSeleccionados
                );

                boton.addEventListener(
                    "click",
                    async () => {

                        const usuarioId =
                            selector.value;

                        const cuenta =
                            cuentas.find(
                                item => item.id === usuarioId
                            );

                        if (!cuenta) return;

                        const permisos =
                            Object.fromEntries(
                                casillas.map(
                                    ({ clave, casilla }) => [
                                        clave,
                                        casilla.checked
                                    ]
                                )
                            );

                        boton.disabled = true;
                        selector.disabled = true;

                        mensaje.textContent =
                            "Guardando cuenta y permisos...";

                        try {

                            const { error } =
                                await supabaseClient.rpc(
                                    "cr_guardar_permisos_empleado",
                                    {
                                        p_empleado_id: empleadoId,
                                        p_usuario_id: usuarioId,
                                        p_permisos: permisos
                                    }
                                );

                            if (error) throw error;

                            if (
                                String(cuenta.rol || "")
                                    .trim()
                                    .toLowerCase() !== "propietario"
                            ) {
                                cuenta.permisos = permisos;
                            }

                            mensaje.textContent =
                                "Cuenta y permisos guardados correctamente.";

                        } catch (error) {

                            console.error(
                                "Error al guardar permisos:",
                                error
                            );

                            mensaje.textContent =
                                "No se pudo guardar: " +
                                (
                                    error.message ||
                                    "Error de conexión."
                                );

                        } finally {

                            boton.disabled = false;
                            selector.disabled = false;

                        }

                    }
                );

                cargarPermisosSeleccionados();

            } catch (error) {

                console.error(
                    "Error al cargar permisos:",
                    error
                );

                mensaje.textContent =
                    "No se pudieron cargar las cuentas: " +
                    (
                        error.message ||
                        "Error de conexión."
                    );

            }

        };

})();
