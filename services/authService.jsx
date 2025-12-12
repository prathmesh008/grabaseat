'use client'
import axios from 'axios'
import config from '@/app/config'
const APIURL = `${config.API_URL}/auth/`;

class authService {
    login = async (credentials) => {
        return axios
            .post(APIURL + "signin", credentials)
            .then(response => {
                if (response.data.accessToken) {
                    localStorage.setItem("user", JSON.stringify(response.data));
                    return response.data
                }
                return null
            });
    }

    signup = async (userData) => {
        try {
            return axios
                .post(APIURL + "signup", userData)
                .then(response => {
                    const data = {
                        message: response.data.message,
                        statusCode: response.status
                    }
                    return data
                })
                .catch(err => {
                    const data = {
                        message: err.response?.data?.message || "Network Error or Server Unreachable",
                        statusCode: err.response?.status || 500
                    }
                    return data
                })
        }
        catch (error) {
            return error
        }
    }

    logout = () => {
        localStorage.removeItem("user");
    }

    getCurrentUser = () => {
        if (typeof window !== 'undefined') {
            return JSON.parse(localStorage.getItem('user'));
        }
    }

}

export default authService