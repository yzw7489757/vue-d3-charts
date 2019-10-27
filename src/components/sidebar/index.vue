<template>
  <div id="app">
   <sidebar class="sidebar">
     <sidebar-item>123</sidebar-item>
     <sidebar-item>123</sidebar-item>
     <sidebar-item>123</sidebar-item>
     <sidebar-item-group>
        <template slot='title'>456</template>
        <sidebar-item>122313</sidebar-item>
        <sidebar-item>1234453</sidebar-item>
     </sidebar-item-group>
   </sidebar>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
    };
  },
  components: {
    sidebar: () => import('./sidebar'),
    sidebarItemGroup: () => import('./sidebarGroup'),
    sidebarItem: () => import('./sidebarItem')
  }
};
</script>

<style lang="scss">
body{
    padding:0;
    margin:0;
}
.sidebar{
  width:400px;
}
  #app{
    height:100vh;
    width:100vw;
    background: #e8e8e8;
  }
</style>
