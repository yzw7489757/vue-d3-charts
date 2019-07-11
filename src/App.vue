<template>
  <div id="app">
    <groupLine :data="list"></groupLine>
  </div>
</template>

<script>
import { mock } from 'mockjs'

const { list } = mock({
  'list|1-5': [
    {
      'name|+1': ['天猫', '网易严选', '云集', '京东', '唯品会'],
      'dataList|5': [
        {
          'date|+1': ['2.1', '2.2', '2.3', '2.4', '2.5'],
          'value|1-100': 100
        }
      ]
    }
  ]
})
export default {
  name: 'App',
  data() {
    return {
      list
    };
  },
};
</script>

<style lang="scss">
body{
    padding:0;
    margin:0;
}
  #app{
    height:100vh;
    width:100vw;
    background: #e8e8e8;
  }
</style>
