import axios from "axios";
import { getToken } from '~/composables/auth.js'

const service = axios.create({
    baseURL: 'https://api.imooc-web.lgdsunday.club/api',
    timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        const token = getToken()
        if (token) {
            config.headers.icode = token
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use((response) => {
    const { success, message, data } = response.data
    // 根据success的成功与否进行下面操作
    if (success) {
        return data
    } else {
        return Promise.reject(new Error(message))
    }
})

export default service