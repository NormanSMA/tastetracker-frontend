<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>

<template>
  <input 
    class="l" 
    type="checkbox" 
    :checked="isDark"
    @change="toggleDark()"
    title="Cambiar modo claro/oscuro"
  />
</template>

<style scoped>
/* Diseño exacto proporcionado por el usuario */
.l {
  display: block;
  /* margin-bottom: 1.5em; <--- Eliminado para ajustar mejor en header */
  font-size: 1em; /* Ajustable según contexto */
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 0.75em;
  box-shadow: 0.125em 0.125em 0 0.125em rgba(0, 0, 0, 0.3) inset;
  color: #fdea7b;
  display: inline-flex;
  align-items: center;
  margin: 0; /* Ajuste para centrar en flex containers */
  padding: 0.15em;
  width: 3em;
  height: 1.5em;
  transition: background-color 0.1s 0.3s ease-out, box-shadow 0.1s 0.3s ease-out;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  position: relative; /* Asegurar contexto para pseudo-elementos */
}

.l:before,
.l:after {
  content: "";
  display: block;
  position: absolute; /* Añadido para posicionar dentro del input */
}

.l:before {
  background-color: #d7d7d7;
  border-radius: 50%;
  width: 1.2em;
  height: 1.2em;
  left: 0.15em; /* Posición inicial */
  transition: background-color 0.1s 0.3s ease-out, transform 0.3s ease-out;
  z-index: 1;
}

.l:after {
  background:
    linear-gradient(transparent 50%, rgba(0, 0, 0, 0.15) 0) 0 50% / 50% 100%,
    repeating-linear-gradient(90deg, #bbb 0, #bbb, #bbb 20%, #999 20%, #999 40%)
      0 50% / 50% 100%,
    radial-gradient(circle at 50% 50%, #888 25%, transparent 26%);
  background-repeat: no-repeat;
  border: 0.25em solid transparent;
  border-left: 0.4em solid #d8d8d8;
  border-right: 0 solid transparent;
  transition: border-left-color 0.1s 0.3s ease-out, transform 0.3s ease-out;
  transform: translateX(0);
  transform-origin: 25% 50%;
  width: 1.2em;
  height: 1em;
  box-sizing: border-box;
  left: 0.15em;
  top: 0.25em; /* Ajuste visual */
}

/* Checked State (Dark Mode) */
.l:checked {
  background-color: rgba(0, 0, 0, 0.45);
  box-shadow: 0.125em 0.125em 0 0.125em rgba(0, 0, 0, 0.1) inset;
}

.l:checked:before {
  background-color: currentColor;
  transform: translateX(125%);
}

.l:checked:after {
  border-left-color: currentColor;
  transform: translateX(150%) rotateY(180deg);
}

.l:focus {
  outline: 0;
}
</style>
