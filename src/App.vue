<template>
    <div class="principal">
        <div class="titulo">
            <h1>REGISTRO DE USUARIOS</h1>
        </div>

        <!--Botones Principales-->
        <div class="botones">
            <buttonPrincipal label="Iniciar Sesión" color="black" textColor="white" @accionBoton="mostrarLogin" />
            <buttonPrincipal label="Registrarse" color="black" textColor="white" @accionBoton="mostrarRegistro" />
        </div>

        <div class="formularios">

            <!-- Sección de inicio-->
            <div v-if="seccion === 'login'" class="formulario">
                <h2>Iniciar Sesión</h2>

                <form @submit.prevent="login">
                    <q-input filled v-model="nombre" type="text" label="Nombre"
                        :rules="[val => !!val || 'El nombre es obligatorio']" />

                    <q-input filled v-model="password" label="Contraseña" type="password" :rules="[
                        val => !!val || 'La contraseña es obligatoria',
                        val => val.length >= 8 || 'Debe tener mínimo 8 caracteres'
                    ]" />

                    <buttonPrincipal label="Entrar" color="black" textColor="white" @accionBoton="login" />
                </form>
            </div>

            <!-- Sección de registro -->
            <div v-if="seccion === 'registro'" class="formulario">
                <h2>Registrarse</h2>

                <form @submit.prevent="registrar">
                    <q-input filled v-model="nombre" type="text" label="Nombres"
                        :rules="[val => !!val || 'El nombre es obligatorio']" />

                    <q-input filled v-model="apellido" type="text" label="Apellidos"
                        :rules="[val => !!val || 'El apellido es obligatorio']" />

                    <q-input filled v-model="email" type="email" label="Correo de la institución"
                        :rules="[val => !!val || 'El correo es obligatorio']" />

                    <q-input filled v-model="password" type="password" label="Contraseña" :rules="[
                        val => !!val || 'La contraseña es obligatoria',
                        val => val.length >= 8 || 'Debe tener mínimo 8 caracteres'
                    ]" />

                    <buttonPrincipal label="Crear Cuenta" color="black" textColor="white" @accionBoton="registrar" />
                </form>
            </div>

        </div>
    </div>
</template>


<script setup>
import { ref } from "vue";
import buttonPrincipal from "./components/buttonPrincipal.vue"
import { Notify } from "quasar";

const seccion = ref("login")
const nombre = ref("")
const apellido = ref("")
const email = ref("")
const password = ref("")

/*  Obtener lista de usuarios desde localStorage */
function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem("usuarios")) || [];
}

/* Guardar lista de usuarios en localStorage */
function guardarUsuarios(lista) {
    localStorage.setItem("usuarios", JSON.stringify(lista));
}

function registrar() {
    if (!nombre.value || !apellido.value || !email.value || password.value.length < 8) {
        Notify.create({
            message: "Completa todos los campos",
            color: "red",
            icon: "error"
        });
        return;
    }

    let usuarios = obtenerUsuarios();

    /* Verificar si el correo ya existe */
    const existe = usuarios.some(u => u.email === email.value);

    if (existe) {
        Notify.create({
            message: "Este correo ya está registrado",
            color: "red",
            icon: "warning"
        });
        return;
    }


    const nuevoUsuario = {
        nombre: nombre.value,
        apellido: apellido.value,
        email: email.value,
        password: password.value
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    Notify.create({
        message: "Usuario creado correctamente",
        color: "green",
        icon: "check"
    });

    /* Borrar datos para dejar en blanco el formulario */
    nombre.value = "";
    apellido.value = "";
    email.value = "";
    password.value = "";

    /* Cambiar de una vez a la pantalla de inicio de sesión*/
    seccion.value = "login";
}

function login() {
    const usuarios = obtenerUsuarios();

    if (usuarios.length === 0) {
        Notify.create({
            message: "No hay usuarios registrados",
            color: "red",
            icon: "error"
        });
        return;
    }

    const usuarioEncontrado = usuarios.find(
        u => u.nombre === nombre.value && u.password === password.value
    );

    if (usuarioEncontrado) {
        Notify.create({
            message: `Bienvenido, ${usuarioEncontrado.nombre}`,
            color: "green",
            icon: "check"
        });


        localStorage.setItem("usuarioActual", JSON.stringify(usuarioEncontrado));

    } else {
        Notify.create({
            message: "Nombre o contraseña incorrectos",
            color: "red",
            icon: "error"
        });
    }
}

function mostrarLogin() {
    seccion.value = "login"
}

function mostrarRegistro() {
    seccion.value = "registro"
}
</script>



<style>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap');

:root {
    --color-primario: #212529;
    --color-fondo: #f8f9fa;
    --color-sombra: rgba(0, 0, 0, 0.1);
    --color-borde-input: #ced4da;
    --color-foco: #0d6efd;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.titulo h1 {
    font-size: 2.5rem;
    font-family: "Oswald", sans-serif;
    font-weight: 700;
    text-align: center;
    color: var(--color-primario);
    margin-bottom: 1.5rem;
}

.botones {
    display: flex;
    justify-content: end;
    margin-right: 15px;
    gap: 15px;
    margin-bottom: 2rem;
}

.button-principal-style {
    padding: 12px 20px;
    font-size: 1.1rem;
    font-weight: bold;
    color: white;
    background-color: var(--color-primario);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s;
    margin-top: 1rem;
    align-self: center;
    width: 100%;
    max-width: 300px;
}

.button-principal-style:hover {
    background-color: #343a40;
    transform: scale(1.02);
}

.button-principal-style:active {
    transform: scale(0.98);
}

.formularios {
    margin-left: 500px;
    margin-right: 500px;
}

.formulario {
    background-color: #ffffff;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 16px var(--color-sombra);
    transition: transform 0.2s ease-in-out;
}

.formulario:hover {
    transform: translateY(-5px);
}

.formulario h2 {
    font-size: 1.75rem;
    font-family: "Oswald", sans-serif;
    font-weight: 500;
    text-align: center;
    margin-bottom: 2rem;
    color: var(--color-primario);
}
</style>
