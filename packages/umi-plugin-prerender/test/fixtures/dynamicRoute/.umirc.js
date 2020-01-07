export default {
  ssr: true,
  routes: [
    {
      path: '/news',
      component: './news/index',
    },
    {
      path: '/news/:b',
      component: './news/b/index',
    },
    { path: '/news/:b/:c', component: './news/b/c/index' },
    {
      path: '/',
      component: './index',
    },
  ],
  plugins: [['../../../lib/index.js']],
};
