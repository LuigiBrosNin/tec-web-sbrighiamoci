<template>
    <div class="not_logged_in_container">
        <p class="text" aria-live="polite" role="alert">you must be logged in to use this section</p>
        <a class="login_btn" href="https://site222326.tw.cs.unibo.it/login">Log in</a>
    </div>
</template>

<style scoped>

.not_logged_in_container {
    display: flex;
    flex-direction: column;
    padding: 1em;
    margin: 1em;
    background-color: #fff;
    border-radius: 1em;
    border-color: #cbcbcb;

    font-size: 1.3em;
}

.text{
    margin: auto;
}

.login_btn {
    width: fit-content;
    height: fit-content;
    color: #fff;
    background-color: #ff8900ff;
    padding: 0.3em 0.5em 0.3em 0.5em;
    border-radius: 1em;
    text-decoration: none;
    margin: auto;
}
</style>