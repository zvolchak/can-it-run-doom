import { getAuth, signInWithEmailAndPassword } from "firebase/auth"

const auth = getAuth()

signInWithEmailAndPassword(auth, "user@example.com", "password123")
  .then(async (userCredential) => {
    const token = await userCredential.user.getIdToken()
    console.log("Token:", token)
  })
  .catch((error) => console.error("Login failed:", error))
