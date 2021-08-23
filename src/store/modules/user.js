import {login, logout, getInfo} from '@/api/user'
import {getToken, setToken, removeToken} from '@/utils/auth'
import {resetRouter} from '@/router'

const getDefaultState = () => {
    return {
        token: getToken(),
        id:'',
        name: '',
        avatar: '',
        tel:'',
        role:''
    }
}

const state = getDefaultState()

const mutations = {
    RESET_STATE: (state) => {
        Object.assign(state, getDefaultState())
    },
    SET_TOKEN: (state, token) => {
        state.token = token
    },
    SET_ID: (state, id) => {
        state.id = id
    },
    SET_NAME: (state, name) => {
        state.name = name
    },
    SET_AVATAR: (state, avatar) => {
        state.avatar = avatar
    },
    SET_TEL: (state, tel) => {
        state.tel = tel
    },
    SET_ROLE: (state, role) => {
        state.role = role
    }
}

const actions = {
    // user login
    login({commit}, userInfo) {
        const {tel, password} = userInfo
        return new Promise((resolve, reject) => {
            login({
                tel: tel.trim(),
                password: password
            }).then(response => {
                const {data} = response
                // 自定义的token名为MC_TOKEN
                data.token = data.MC_TOKEN
                commit('SET_TOKEN', data.token)
                setToken(data.token)
                resolve()
            }).catch(error => {
                console.log(error)
                reject(error)
            })
        })
    },

    // get user info
    getInfo({commit, state}) {
        return new Promise((resolve, reject) => {
            getInfo(state.token).then(response => {
                const {data} = response

                if (!data) {
                    return reject('认证异常，请重新登陆')
                }

                const {id,avatar,name,tel,role} = data

                commit('SET_ID', id)
                commit('SET_AVATAR', avatar)
                commit('SET_NAME', name)
                commit('SET_TEL', tel)
                commit('SET_ROLE', role)

                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },

    // user logout
    logout({commit, state}) {
        return new Promise((resolve, reject) => {
            logout(state.token).then(() => {
                removeToken() // must remove  token  first
                resetRouter()
                commit('RESET_STATE')
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    },

    // remove token
    resetToken({commit}) {
        return new Promise(resolve => {
            removeToken() // must remove  token  first
            commit('RESET_STATE')
            resolve()
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}

