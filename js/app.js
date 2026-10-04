/* =========================================================
   CONTROL RESTAURANTE
   DASHBOARD INICIAL
   ========================================================= */


/* ---------------------------------------------------------
   INICIO
   --------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    iniciarAplicacion();

});


/* ---------------------------------------------------------
   APLICACIÓN
   --------------------------------------------------------- */

function iniciarAplicacion() {

    mostrarDashboard();

}


/* ---------------------------------------------------------
   DASHBOARD
   --------------------------------------------------------- */

function mostrarDashboard() {

    const app = document.getElementById("app");

    if (!app) return;


    app.innerHTML = `

        <div class="sistema">

            <!-- =========================================
                 BARRA SUPERIOR
                 ========================================= -->

            <header class="topbar">

                <div class="marca">

                    <div class="marca-icono">
                        CR
                    </div>

                    <div>

                        <strong>
                            Control Restaurante
                        </strong>

                        <span>
                            Administración inteligente
                        </span>

                    </div>

                </div>


                <button
                    class="usuario-boton"
                    type="button"
                >

                    <span class="usuario-avatar">
                        R
                    </span>

                    <span class="usuario-info">

                        <strong>
                            Rodrigo
                        </strong>

                        <small>
                            Administrador
                        </small>

                    </span>

                </button>

            </header>


            <!-- =========================================
                 CONTENIDO
                 ========================================= -->

            <main class="contenido">

                <section class="bienvenida">

                    <div>

                        <p class="etiqueta">
                            MIÉRCOLES · 03 OCTUBRE 2026
                        </p>

                        <h1>
                            Buenos días, Rodrigo 👋
                        </h1>

                        <p>
                            Aquí tienes el estado de tu restaurante.
                        </p>

                    </div>


                    <div class="estado-jornada">

                        <span class="punto-verde"></span>

                        Sistema operativo

                    </div>

                </section>


                <!-- =====================================
                     ACCIÓN PRINCIPAL
                     ===================================== -->

                <section class="accion-principal">

                    <div class="accion-icono">
                        📸
                    </div>

                    <div class="accion-texto">

                        <span>
                            ACCIÓN RÁPIDA
                        </span>

                        <h2>
                            Capturar ticket
                        </h2>

                        <p>
                            Fotografía un ticket y deja que
                            el sistema prepare la información
                            para validarla.
                        </p>

                    </div>

                    <button
                        class="btn btn-primary"
                        type="button"
                        onclick="capturarTicket()"
                    >
                        Capturar ticket
                    </button>

                </section>


                <!-- =====================================
                     INDICADORES
                     ===================================== -->

                <section class="indicadores">

                    <article class="indicador">

                        <div class="indicador-icono ventas">
                            $
                        </div>

                        <div>

                            <span>
                                Ventas de hoy
                            </span>

                            <strong>
                                $12,850
                            </strong>

                            <small class="positivo">
                                ↑ 8.4% vs. ayer
                            </small>

                        </div>

                    </article>


                    <article class="indicador">

                        <div class="indicador-icono compras">
                            🛒
                        </div>

                        <div>

                            <span>
                                Compras pendientes
                            </span>

                            <strong>
                                4
                            </strong>

                            <small>
                                Por validar
                            </small>

                        </div>

                    </article>


                    <article class="indicador">

                        <div class="indicador-icono inventario">
                            📦
                        </div>

                        <div>

                            <span>
                                Alertas de inventario
                            </span>

                            <strong>
                                3
                            </strong>

                            <small class="negativo">
                                Requieren atención
                            </small>

                        </div>

                    </article>


                    <article class="indicador">

                        <div class="indicador-icono caja">
                            💵
                        </div>

                        <div>

                            <span>
                                Caja actual
                            </span>

                            <strong>
                                $8,420
                            </strong>

                            <small>
                                Operación normal
                            </small>

                        </div>

                    </article>

                </section>


                <!-- =====================================
                     DOS COLUMNAS
                     ===================================== -->

                <section class="dashboard-grid">


                    <!-- ACTIVIDAD -->

                    <article class="panel">

                        <div class="panel-cabecera">

                            <div>

                                <h2>
                                    Actividad reciente
                                </h2>

                                <p>
                                    Últimos movimientos
                                </p>

                            </div>

                            <button
                                class="texto-boton"
                                type="button"
                            >
                                Ver todo
                            </button>

                        </div>


                        <div class="actividad">

                            <div class="actividad-item">

                                <div class="actividad-icono compra">
                                    🛒
                                </div>

                                <div class="actividad-info">

                                    <strong>
                                        Compra registrada
                                    </strong>

                                    <span>
                                        Proveedor pendiente de validar
                                    </span>

                                </div>

                                <time>
                                    10:42
                                </time>

                            </div>


                            <div class="actividad-item">

                                <div class="actividad-icono venta">
                                    $
                                </div>

                                <div class="actividad-info">

                                    <strong>
                                        Venta registrada
                                    </strong>

                                    <span>
                                        Pedido #1048 · Restaurante
                                    </span>

                                </div>

                                <time>
                                    10:35
                                </time>

                            </div>


                            <div class="actividad-item">

                                <div class="actividad-icono inventario">
                                    📦
                                </div>

                                <div class="actividad-info">

                                    <strong>
                                        Inventario actualizado
                                    </strong>

                                    <span>
                                        Cerveza · existencia ajustada
                                    </span>

                                </div>

                                <time>
                                    10:18
                                </time>

                            </div>


                            <div class="actividad-item">

                                <div class="actividad-icono caja">
                                    💵
                                </div>

                                <div class="actividad-info">

                                    <strong>
                                        Movimiento de caja
                                    </strong>

                                    <span>
                                        Compra operativa
                                    </span>

                                </div>

                                <time>
                                    09:56
                                </time>

                            </div>

                        </div>

                    </article>


                    <!-- ALERTAS -->

                    <article class="panel">

                        <div class="panel-cabecera">

                            <div>

                                <h2>
                                    Alertas
                                </h2>

                                <p>
                                    Atención requerida
                                </p>

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
                                        Cebolla blanca · quedan 5 kg
                                    </p>

                                </div>

                            </div>


                            <div class="alerta alerta-amarilla">

                                <div class="alerta-icono">
                                    !
                                </div>

                                <div>

                                    <strong>
                                        Tickets pendientes
                                    </strong>

                                    <p>
                                        4 compras esperan validación
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
                                        Compra operativa por comprobar
                                    </p>

                                </div>

                            </div>


                        </div>

                    </article>

                </section>


                <!-- =====================================
                     ACCESOS
                     ===================================== -->

                <section class="accesos">

                    <button type="button">
                        📦
                        <span>
                            Inventario
                        </span>
                    </button>

                    <button type="button">
                        🛒
                        <span>
                            Compras
                        </span>
                    </button>

                    <button type="button">
                        🍽️
                        <span>
                            Ventas
                        </span>
                    </button>

                    <button type="button">
                        💵
                        <span>
                            Caja
                        </span>
                    </button>

                    <button type="button">
                        📊
                        <span>
                            Reportes
                        </span>
                    </button>

                    <button type="button">
                        👥
                        <span>
                            Usuarios
                        </span>
                    </button>

                </section>

            </main>


            <!-- =========================================
                 NAVEGACIÓN MÓVIL
                 ========================================= -->

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
                    <span>🛒</span>
                    Compras
                </button>

                <button>
                    <span>💵</span>
                    Caja
                </button>

                <button>
                    <span>☰</span>
                    Más
                </button>

            </nav>

        </div>

    `;

}


/* ---------------------------------------------------------
   CAPTURAR TICKET
   --------------------------------------------------------- */

function capturarTicket() {

    alert(
        "Aquí abriremos la cámara para capturar el ticket."
    );

}