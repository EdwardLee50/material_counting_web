import router from './router'
import store from './store'
import {Message} from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import {getToken} from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({showSpinner: false}) // NProgress Configuration 没有重定向白名单的页面路径，直接返回的是login页面

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
    // start progress bar
    // 开始进度条
    NProgress.start()

    // set page title
    //  设置标签页面标题
    document.title = getPageTitle(to.meta.title)

    // determine whether the user has logged in
    // 根据token的有无判断用户是否已经登录
    const hasToken = getToken()

    if (hasToken) {
        if (to.path === '/login') {
            // if is logged in, redirect to the home page
            //  若已经登录,放行重定向到"/"页面
            next({path: '/'})
            NProgress.done()
        } else {
            const hasGetUserRole = store.getters.role

            // 判断用户是否通过getInfo获得了权限角色
            if (hasGetUserRole) {
                next()
            } else {
                try {
                    // get user info
                    //  调用方法获取用户信息,await表示获得响应前阻塞
                    await store.dispatch('user/getInfo')

                    console.log("permission.js 的 router.beforeEach 中执行 getInfo" +
                        "; to.path ==> " + to.path +
                        "; from.path ==> " + from.path)
                    next()

                    // //  调用方法获取用户信息,await表示获得响应前阻塞
                    // const { role } = await store.dispatch('user/getInfo')
                    //
                    // //  生成基于角色的可访问路径(路由)
                    // const accessRoutes = await store.dispatch('permission/generateRoutes', role)
                    //
                    // //  动态添加可访问路由,其中accessRoutes通过store中permission.js(未定义)的generateRoutes方法(action)生成,传入roles参数
                    // router.addRoutes(accessRoutes)
                    //
                    // // hack方法确保添加路由是彻底的,设置replace: true来保证导航不会留下历史记录
                    // next({ ...to, replace: true })
                } catch (error) {
                    // remove token and go to login page to re-login
                    //  移除token并跳转到login登录页面重新登录
                    await store.dispatch('user/resetToken')
                    Message.error(error || 'Has Error')
                    next(`/login?redirect=${to.path}`)
                    NProgress.done()
                }
            }
        }
    } else {
        /* has no token*/

        if (whiteList.indexOf(to.path) !== -1) {
            // in the free login whitelist, go directly
            //  在放行白名单中的页面路径直接放行
            next()
        } else {
            // other pages that do not have permission to access are redirected to the login page.
            //  其他没有权限的访问被定位到login登录页，并以重定向后缀的形式表明跳转原路径
            next(`/login?redirect=${to.path}`)
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    // finish progress bar
    NProgress.done()
})
