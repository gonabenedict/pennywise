export const useGetUserInfo = () => {
    try {
        const authData = localStorage.getItem("auth");
        if (authData) {
            const { name, profilePhoto, userID, email, isAuth } = JSON.parse(authData);
            return { name, profilePhoto, userID, email, isAuth };
        }
    } catch (error) {
        console.error("Error parsing auth data:", error);
    }
    
    // Return default values if no auth data or error
    return { name: "", profilePhoto: "", userID: "", email: "", isAuth: false };
};