'use client'
import React, { useEffect, useMemo } from 'react';
import AuthService from '@/services/authService';
import { useRouter } from 'next/navigation';


export default function Auth(Component) {
    return function Auth(props) {

        const authService = useMemo(() => new AuthService(), []);
        const currentUser = authService.getCurrentUser()
        const redirect = useRouter()

        useEffect(() => {
            if (!currentUser) {
                redirect.push('/')
                redirect.refresh()
            }
            if (currentUser?.roles[0] === 'ROLE_USER') {
                redirect.push('/user')
                redirect.refresh()
            }
            if (currentUser?.roles[0] === 'ROLE_ADMIN') {
                redirect.push('/admin')
                redirect.refresh()
            }
        }, [currentUser, redirect])

        if (!currentUser) {
            return null
        }
        return <Component {...props} />
    };
}