

<template>
  <nav>
    <RouterLink to="/" class="router_link" aria-label="Home">
      <img class="icon not_selected" src="https://site222326.tw.cs.unibo.it/icons/house-floor-svgrepo-com.svg" />
      <p>Home</p>
    </RouterLink>
    <RouterLink to="/search" class="router_link" aria-label="Search">
      <img class="icon not_selected" src="https://site222326.tw.cs.unibo.it/icons/search-alt-1-svgrepo-com.svg" />
      <p>Search</p>
    </RouterLink>
    <RouterLink to="/channels" class="router_link" aria-label="Channels">
      <img class="icon not_selected" src="https://site222326.tw.cs.unibo.it/icons/podcast-svgrepo-com.svg" />
      <p>Channels</p>
    </RouterLink>
    <RouterLink to="/messages" class="router_link" v-if="$user" aria-label="Messages">
      <img class="icon not_selected" src="https://site222326.tw.cs.unibo.it/icons/message-circle-dots-svgrepo-com.svg" />
      <p>Messages</p>
    </RouterLink>
    <RouterLink :to="`/profile/${$user}`" class="router_link" v-if="$user" aria-label="Profile">
      <img class="icon not_selected" src="https://site222326.tw.cs.unibo.it/icons/user-svgrepo-com.svg" />
      <p>{{ $user || "Profile" }}</p>
    </RouterLink>
    <a href="https://site222326.tw.cs.unibo.it/login" class="router_link" v-if="!$user" aria-label="Login">
      <img class="icon not_selected" src="https://site222326.tw.cs.unibo.it/icons/user-svgrepo-com.svg" />
      <p>Login</p>
    </a>

    <div class="switch_area_btn">
      <a href="https://site222326.tw.cs.unibo.it/admin" v-if="$typeOfUser == 'admin'" class="admin_btn switch_btn" aria-label="Go to admin dashboard">Go to admin dashboard</a>
      <a href="https://site222326.tw.cs.unibo.it/smm" v-if="$typeOfUser == 'smm'" class="smm_btn switch_btn" aria-label="Go to smm dashboard">Go to smm dashboard</a>
    </div>
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
  overflow-y: auto;
  overflow-x: hidden;
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

.switch_area_btn {
  margin: 0.5em;
    display: flex;
    height: 100%;
    flex-direction: column-reverse;
}

.switch_btn {
  border-radius: 1em;
  text-decoration: none;
  text-align: center;
  font-size: 0.8em;
}

.admin_btn {
  color: #fff;
  background-color: #ff0000;
}

.smm_btn {
  color: #fff;
  background-color: #208454;
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

  .switch_area_btn {
    display: none;
  }
}
</style>