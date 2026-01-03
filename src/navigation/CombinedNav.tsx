import { useSelector } from 'react-redux'
import React from 'react'
import AuthenticatedStack from './authenticated'
import UnauthenticatedStack from './unauthenticated'

const CombinedNav: React.FC = () => {
    const { token } = useSelector((state: any) => state.auth);
    return token ? <AuthenticatedStack /> : <UnauthenticatedStack />
}


export default CombinedNav;