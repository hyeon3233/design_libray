<script setup>
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
</script>

<template>
  <div class="app-layout">
    <Sidebar />

    <div class="main-area">
      <Header />

      <main class="page-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
