import { auth, provider } from "../../config/firebase-config";
import { db } from "../../config/firebase-config";
import { signInWithPopup } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Navigate} from "react-router-dom"; 
import { useGetUserInfo } from "../../hooks/useGetUserInfo";

export const Auth = () => {
    const navigate = useNavigate();
    const { isAuth } = useGetUserInfo();

    const SignInWithGoogle = async () => {
        try {
            const results = await signInWithPopup(auth, provider);
            const user = results.user;
            
            // Save user info to Firestore
            await setDoc(doc(db, "users", user.uid), {
                userID: user.uid,
                email: user.email,
                name: user.displayName,
                profilePhoto: user.photoURL,
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp()
            }, { merge: true }); // merge: true to update existing user without overwriting other fields
            
            const authInfo = {
                userID: user.uid,
                email: user.email,
                name: user.displayName,
                profilePhoto: user.photoURL,
                isAuth: true,
            }
            localStorage.setItem("auth", JSON.stringify(authInfo));
            navigate("/expense-tracker");
        } catch (error) {
            console.error("Authentication error:", error);
            if (error.code === 'auth/popup-blocked') {
                alert('Popup was blocked by browser. Please allow popups for this site and try again.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                alert('Sign-in was cancelled. Please try again.');
            } else {
                alert('Authentication failed. Please try again.');
            }
        }
    };

    if (isAuth) {
        return <Navigate to="/expense-tracker" />;
    }
    
    return (
        <div className="login-page">
            <p>
                Sign in with google to continue
            </p>
            <button className="login-with-google-btn" onClick={SignInWithGoogle}>
                Sign in with Google
            </button>
        </div>
    );
};