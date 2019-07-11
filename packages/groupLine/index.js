import groupLine from './src/index'

groupLine.install = (Vue) => {
  Vue.component(groupLine.name, groupLine)
}
export default groupLine