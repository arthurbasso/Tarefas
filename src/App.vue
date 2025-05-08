<template>
  <div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9f9fb;
  margin: 0;
  padding: 0;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  width: 100%;
  max-width: 300px;
}

input:focus {
  border-color: #42b983;
}

button {
  background-color: #42b983;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #36976b;
}

h2 {
  color: #333;
}
</style>
