// 'use client';

// import React, { createContext, useEffect, useState } from 'react';
// import Cookies from 'js-cookie';

// const CookiesContext = createContext(null);
// export default function SessionProvider({ children }: { children: React.JSX.Element }) {
//   const [cookies, setCookies] = useState<object>({ access_token: '' });
//   useEffect(() => {
//     const token = Cookies.get('access_token');
//     setCookies({ access_token: token });
//   }, []);

//   return <CookiesContext.Provider value={cookies}>{children}</CookiesContext.Provider>;
// }
