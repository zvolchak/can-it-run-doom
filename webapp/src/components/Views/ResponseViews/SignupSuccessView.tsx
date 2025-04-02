import { useRouter } from "next/router"

export function SignupSuccessView({ email = ""}) {
    const router = useRouter()

    return (
        <div className="text-center p-2 mt-12">
            <p className="title">
                Your account has been created! A verification email has been sent to 
                &quot;{email}&quot;.
            </p>

            <button 
                className="doom-action-btn mt-10 p-2 w-48"
                onClick={() => router.push("/login")}
            >
                Back to Login
            </button>
        </div>
    )
} // SuccessView
