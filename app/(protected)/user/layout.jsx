'use client'
import React, { useEffect, useState } from 'react';
import useAuthCheck from '@/components/Auth/authCheck'
import { useRouter } from 'next/navigation';

const Layout = ({ children }) => {

    const { isAdmin, isUser } = useAuthCheck();

    // User Ready Status
    const [loggedStatus, setLoggedStatus] = useState(false);

    useEffect(() => {
        if (isUser()) {
            setLoggedStatus(true)
        }
    }, [setLoggedStatus, isUser]);

    const router = useRouter()

    return (
        <>
            {loggedStatus &&
                (isUser() ?
                    <div className='overflow-x-hidden'>
                        {children}
                    </div>
                    : isAdmin() ?
                        router.push('/admin')
                        : router.push('/')
                )}
        </>
    );
};

export default Layout;