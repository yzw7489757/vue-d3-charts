<template>
  <div class="sidebarGroup">
    <div class="sidebarGroup__title">
      <slot name="title" tag="div"></slot>
    </div>
    <div class="sidebarGroup__list">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'sidebarGroup',
  data() {
    return {

    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarGroup{
  &_title{
    padding-left:0;
  }
  &__list{
    padding-left:10px;
  }
}
</style>