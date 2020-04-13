import React from 'react';

const MyContext = React.createContext({islogged: false, setIsLogged:value => {}})

export default MyContext;