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
                    <q-btn label="Iniciar con Face ID" color="secondary" class="q-mt-md full-width"
                        @click="iniciarFaceIDLogin" />

                </form>
            </div>
            <!--sesion con face id-->
            <q-dialog v-model="mostrarDialogoFaceLogin" persistent>
                <q-card style="width: 360px; padding: 20px;">
                    <h4 class="text-center">Validar Rostro</h4>

                    <video ref="videoLoginRef" autoplay playsinline width="300" height="220"
                        style="border-radius: 10px; border: 2px solid #000; margin: 10px auto;"></video>

                    <q-btn label="Validar Rostro" color="green" class="full-width q-mt-md"
                        @click="validarRostroLogin" />

                    <q-btn label="Cancelar" flat class="full-width q-mt-sm" @click="cerrarModalFaceLogin" />
                </q-card>
            </q-dialog>


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

                    <q-btn label="Registrar Face ID" color="primary" class="q-mt-md" @click="abrirFaceID" />

                </form>
            </div>
        </div>
        <!--registro con face id-->
        <q-dialog v-model="mostrarDialogoFaceId" persistent>
            <q-card style="width: 350px; padding: 20px;">
                <h4 class="text-center">Registrar Rostro</h4>

                <video ref="videoRef" autoplay playsinline width="300" height="220"
                    style="border-radius: 10px; border: 2px solid #000;"></video>

                <q-btn label="Guardar Rostro" color="green" class="full-width q-mt-md" @click="capturarRostro" />

                <q-btn label="Cancelar" flat class="full-width q-mt-sm" @click="mostrarDialogoFaceId = false" />
            </q-card>
        </q-dialog>

    </div>
</template>


<script setup>
import { ref } from "vue";
import buttonPrincipal from "./components/buttonPrincipal.vue"
import * as faceapi from "face-api.js";
import { onMounted } from "vue";
import { Notify } from "quasar";
/* registro con  face id*/
const mostrarDialogoFaceId = ref(false);
const videoRef = ref(null);
/* inicar sesión face id*/
const mostrarDialogoFaceLogin = ref(false);
const videoLoginRef = ref(null);
let streamLogin = null;

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
        password: password.value,
        faceId: JSON.parse(localStorage.getItem("faceTemp")) || null
    };
    localStorage.removeItem("faceTemp");


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
/* registro face id*/
async function abrirFaceID() {
    mostrarDialogoFaceId.value = true;

    await cargarModelos();
    iniciarCamara();
}

async function cargarModelos() {
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
}

async function iniciarCamara() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.value.srcObject = stream;
}

async function capturarRostro() {
    const deteccion = await faceapi
        .detectSingleFace(videoRef.value)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!deteccion) {
        Notify.create({
            message: "No se detectó un rostro",
            color: "red",
            icon: "error",
        });
        return;
    }

    const descriptorArray = Array.from(deteccion.descriptor);

    // Guardamos rostro al usuario en creación
    localStorage.setItem(
        "faceTemp",
        JSON.stringify(descriptorArray)
    );

    Notify.create({
        message: "Rostro registrado correctamente",
        color: "green",
        icon: "check"
    });

    mostrarDialogoFaceId.value = false;
}
/* inicar sesión face id*/
async function iniciarFaceIDLogin() {
  mostrarDialogoFaceLogin.value = true;
  await cargarModelos();
  iniciarCamaraLogin();
}

async function iniciarCamaraLogin() {
  streamLogin = await navigator.mediaDevices.getUserMedia({ video: true });
  videoLoginRef.value.srcObject = streamLogin;
}

function cerrarModalFaceLogin() {
  mostrarDialogoFaceLogin.value = false;
  if (streamLogin) {
    streamLogin.getTracks().forEach(track => track.stop());
  }
}

async function validarRostroLogin() {
  const usuarios = obtenerUsuarios();
  const deteccion = await faceapi
    .detectSingleFace(videoLoginRef.value)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!deteccion) {
    Notify.create({ message: "No se detectó rostro", color: "red" });
    return;
  }

  const descriptorActual = deteccion.descriptor;

  for (const usuario of usuarios) {
    if (!usuario.faceId) continue;

    const distancia = faceapi.euclideanDistance(
      new Float32Array(usuario.faceId),
      descriptorActual
    );

    if (distancia < 0.45) {
      Notify.create({
        message: `Bienvenido, ${usuario.nombre}`,
        color: "green",
        icon: "check",
      });

      localStorage.setItem("usuarioActual", JSON.stringify(usuario));

      cerrarModalFaceLogin();
      return;
    }
  }

  Notify.create({ message: "Rostro no coincide", color: "red" });
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
