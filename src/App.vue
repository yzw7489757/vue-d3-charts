<template>
  <div id="app">
    <groupLine :data="list"></groupLine>
    <button @click="change" style="margin-top:100px">change</button>
  </div>
</template>

<script>
import { mock } from 'mockjs'

const { list } = mock({
  'list|5': [
    {
      'name|+1': ['天猫', '网易严选', '云集', '京东', '唯品会'],
      'dataList|10': [
        {
          'date|+1': ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10'],
          'value|1000-10000': 100
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
  methods: {
    change() {
      this.list = mock({
        'list|5': [
          {
            'name|+1': ['天猫', '网易严选', '云集', '京东', '唯品会'],
            'dataList|10': [
              {
                'date|+1': ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10'],
                'value|10-100': 100
              }
            ]
          }
        ]
      }).list
    }
  },
  components: {}
};
</script>

<style lang="scss">
body{
    padding:0;
    margin:0;
}
  #app{
    padding: 30px;
  }
</style>
