 const getUser = async () => {
    try {
      const response = await fetch("/api/user/userDetails");
      const data = await response.json();
     return data
    } catch (error) { }
  };

  export default getUser;