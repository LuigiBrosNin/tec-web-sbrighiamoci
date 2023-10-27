<template>
    <nav>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/search">Search</RouterLink>
          <RouterLink to="/channels">Channels</RouterLink>
          <RouterLink to="/messages">Messages</RouterLink>
          <RouterLink to="/profile">Profile</RouterLink>
    </nav>
</template>

<style scoped>
nav {
  box-shadow: 0px 5px 5px;
  width: 20%;
  font-size: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  font-size: 1.5em;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

</style>