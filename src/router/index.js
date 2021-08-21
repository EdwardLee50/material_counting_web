import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
    // 登录页， hidden: true 不在侧边栏显示
    {
        path: '/login',
        component: () => import('@/views/login/index'),
        hidden: true
    },
    // 首页
    {
        path: '/',
        component: Layout,
        redirect: '/home',
        children: [{
            path: 'home',
            name: 'Dashboard',
            component: () => import('@/views/dashboard/index'),
            meta: {title: '首页', icon: 'dashboard'}
        }]
    },
    // 404页
    {
        path: '/404',
        component: () => import('@/views/404'),
        hidden: true
    },
    // 记录管理
    {
        path: '/orderManage',
        component: Layout,
        redirect: '/orderManage/listAll',
        meta: {title: '物料单管理', icon: 'el-icon-s-help'},
        children: [
            // 筛选查看
            {
                path: 'listAll',
                name: 'listAll',
                component: () => import('@/views/orderManagement/listAll/index'),
                meta: { title: '查看及管理', icon: 'table'}
            },
            // 批量确认

            // 批量失效

            // 批量创建
            {
                path: 'batchCreate',
                name: 'batchCreate',
                component: () => import('@/views/orderManagement/batchCreate/index'),
                meta: {title: '批量创建', icon: 'el-icon-upload'}
            }
            // // 查看物料单及其状态、修改状态信息 todo
            // {
            //     path: 'orders',
            //     name: 'orders',
            //     component: () => import('@/views/orderManagement/orders/index'),
            //     meta: {title: '查看与更新', icon: 'table'}
            // }
            // // 可编辑表格，创建物料单、以excel表格上传todo
            // ,{
            //     path: 'simpleAdd',
            //     name: 'simpleAdd',
            //     component: () => import('@/views/orderManagement/create/index'),
            //     meta: {title: '（批量）创建', icon: 'table'}
            // }
        ]
    },


    // 人员管理

    // 404 page must be placed at the end !!!
    {path: '*', redirect: '/404', hidden: true}
]


const createRouter = () => new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({y: 0}),
    routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher // reset router
}

export default router
