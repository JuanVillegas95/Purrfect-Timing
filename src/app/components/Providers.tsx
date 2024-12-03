// "use client"
// import React, { useState, createContext, useContext, useEffect } from "react";
// import { ColorModeProvider } from "./ui/color-mode";
// import { ChakraProvider, Theme, defaultSystem } from "@chakra-ui/react"
// import { signInWithPopup, GoogleAuthProvider, signOut, GithubAuthProvider, onAuthStateChanged, User } from "firebase/auth";
// import { auth } from "@/config/firebase";
// import { useRouter } from "next/navigation";
// const ThemeContext = createContext<{
//     theme: "light" | "dark";
//     toggleTheme: () => void;
// } | null>(null);

// export const useTheme = () => {
//     const context = useContext(ThemeContext);
//     if (!context) throw new Error("useTheme must be used within a ThemeContext.Provider");
//     return context;
// };

// const AuthContext = createContext<{
//     user: User | null;
//     signIn: (providerName: "google" | "github") => Promise<void>
//     signOut: () => Promise<void>;
// } | null>(null)

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) throw new Error("useAuth must be used within an AuthContext.Provider");
//     return context;
// };


// const Providers = ({ children }: { children: React.ReactNode }) => {
//     const [theme, setTheme] = useState<"light" | "dark">("light");
//     const [user, setUser] = useState<User | null>(null);
//     const router = useRouter();
//     const toggleTheme = (): void =>
//         setTheme((state) => (state === "light" ? "dark" : "light"));


//     const signIn = async (providerName: "google" | "github"): Promise<void> => {
//         try {
//             let userCredential;
//             switch (providerName) {
//                 case "google":
//                     userCredential = await signInWithPopup(auth, new GoogleAuthProvider());
//                     break;
//                 case "github":
//                     userCredential = await signInWithPopup(auth, new GithubAuthProvider());
//                     break;
//                 default:
//                     console.error(`Unsupported provider: ${providerName}`);
//             }
//             router.push("/dashboard")
//         } catch (error) {

//         }
//     };

//     const signOutUser = async (): Promise<void> => {
//         try {
//             await signOut(auth);
//         }
//         catch (error) {
//             console.error("Error during sign-out:", error);
//         }
//     };



//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//             setUser(currentUser);
//         });

//         return () => unsubscribe();
//     }, []);



//     return <AuthContext.Provider value={{ user, signIn, signOut: signOutUser }}>
//         <ThemeContext.Provider value={{ theme, toggleTheme }}>
//             <ChakraProvider value={defaultSystem}>
//                 <ColorModeProvider forcedTheme={theme}>
//                     <Theme appearance={theme}>
//                         {children}
//                     </Theme>
//                 </ColorModeProvider>
//             </ChakraProvider>
//         </ThemeContext.Provider>
//     </AuthContext.Provider>
// };

// export default Providers;


