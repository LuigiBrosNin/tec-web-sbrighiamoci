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
  text-align: center;
  display: flex;
  flex-direction: column;
  font-size: 1.5em;
  padding-top: 1em;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0.5em 1rem;
  border-left: 1px solid var(--color-border);
  color: #005b82ff;
}

nav a:first-of-type {
  border: 0;
}

</style>