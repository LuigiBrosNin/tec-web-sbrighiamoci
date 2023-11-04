

<template>
  <nav>
    <RouterLink to="/" class="router_link">
      <img class="icon not_selected" src="https://site222326.tw.cs.unibo.it/icons/house-floor-svgrepo-com.svg" />
      <p>Home</p>
    </RouterLink>
    <RouterLink to="/search" class="router_link">
      <img class="icon not_selected" src="https://site222326.tw.cs.unibo.it/icons/search-alt-1-svgrepo-com.svg" />
      <p>Search</p>
    </RouterLink>
    <RouterLink to="/channels" class="router_link">
      <img class="icon not_selected" src="https://site222326.tw.cs.unibo.it/icons/podcast-svgrepo-com.svg" />
      <p>Channels</p>
    </RouterLink>
    <RouterLink to="/messages" class="router_link">
      <img class="icon not_selected" src="https://site222326.tw.cs.unibo.it/icons/message-circle-dots-svgrepo-com.svg" />
      <p>Messages</p>
    </RouterLink>
    <RouterLink to="/profile" class="router_link">
      <img class="icon not_selected" src="https://site222326.tw.cs.unibo.it/icons/user-svgrepo-com.svg" />
      <p>{{ $user || "Profile" }}</p>
    </RouterLink>
    <RouterLink to="/uploader" class="router_link">
      <img class="icon not_selected" src="https://site222326.tw.cs.unibo.it/icons/user-svgrepo-com.svg" />
      <p>Uploader TEMP</p>
    </RouterLink>
    <RouterLink to="/squealPut" class="router_link">
      <img class="icon not_selected" src="https://site222326.tw.cs.unibo.it/icons/house-floor-svgrepo-com.svg" />
      <p>Squeals PUT TEMP</p>
    </RouterLink>
  </nav>
</template>

<style scoped>
nav {
  box-shadow: 0px 5px 5px;
  width: 20%;
  text-align: left;
  display: flex;
  flex-direction: column;
  font-size: 1.5em;
  padding-top: 1em;
  z-index: 9;
  overflow: hidden;
}

nav .router-link-exact-active {
  filter: brightness(0%);
}

nav .router-link-exact-active:hover {
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

.icon {
  height: 1.5em;
}

/*
to calculate the filter:
https://codepen.io/sosuke/pen/Pjoqqp
*/
.not_selected {
  filter: invert(16%) sepia(78%) saturate(3470%) hue-rotate(182deg) brightness(92%) contrast(103%);
}

.router_link {
  display: flex;
  flex-direction: row;
}

@media screen and (max-width: 950px) {
  nav {
    box-shadow: 0px 0px 5px;
    width: 100%;
    flex-direction: row;
    justify-content: space-around;
    padding-top: 0em;
    overflow: visible;
  }
  p {
    display: none;
  }
}
</style>