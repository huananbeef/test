<template>
  <router-view></router-view>
</template>

<script type="text/babel">
export default {
  name: 'product',
  created () {
    let appid = this.$http.getUrlParam('appid')
    let ut = this.$http.getUrlParam('ut')
    if (appid) {
      sessionStorage.setItem('appid', appid)
    }
    if (ut) {
      sessionStorage.setItem('ut', ut)
    }
    if (appid && !ut) {
      sessionStorage.removeItem('ut', ut)
    }
  }
}
</script>

<style>
</style>
