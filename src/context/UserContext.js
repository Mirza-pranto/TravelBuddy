// src/context/user/UserContext.js

import React, { createContext, useState } from 'react';

// Create the context
const UserContext = createContext();

// Create the provider component
const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // or use {} instead of null if you prefer

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
