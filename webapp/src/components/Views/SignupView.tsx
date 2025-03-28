import { useForm } from "react-hook-form"
import { useState } from "react"
import { useDispatch, useSelector, } from "react-redux"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import {
    signupWithEmailAndPassword,
} from "@/src/api"
import {
    RootState,
    setUserData,
} from "@/src/store"
import {
    IsSessionExpired,
} from "@/src/utils"
import { SignupSuccessView } from "./ResponseViews"
import { IUserAuthResponse, IUserData } from "@/src/types"
import Link from "next/link"


interface LoginForm {
    email: string
    password: string
}


interface SignupViewProps {
    className?: string
}


export function SignupView({
    className = "",
}: SignupViewProps) {
    const dispatch = useDispatch()
    const router = useRouter()
    const user: IUserData = useSelector((state: RootState) => state.user.data)
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        mode: "onBlur"
    })
    const [errorMessage, setErrorMessage] = useState("")
    const [signupState, setSignupState] = useState<"success" | "failed" | null>(null)
    const [signupData, setSignupData] = useState<IUserAuthResponse | null>(null)


    async function onSubmit(data) {
        // let user = JSON.parse(Cookies.get("user"))

        setSignupState(null)
        const userData = await signupWithEmailAndPassword(data.email, data.password)
        if (userData?.status_code >= 400) {
            setSignupState("failed")
            setErrorMessage(userData.message)
            return
        }
        setSignupData(userData)
        if (!userData?.user) {
            setSignupState("failed")
            setErrorMessage("Failed to create an account! Please try again or contact support if the error persists.")
            return
        }

        setSignupState("success")
    } // onSubmit


    return (
        <>
        { signupState !== "success" &&
            <form
                onSubmit={handleSubmit(onSubmit)}
                className={`w-1/3 text-gray-300 ${className}`}
            >
                <h2 className="title text-center mb-4">
                    Create Account
                </h2>

                {errorMessage && (
                    <p className="text-red-500 text-center mb-4">
                        {errorMessage}
                    </p>
                )}

                <div className="mb-4">
                    <label className="">
                        Email
                    </label>
                    <input
                        type="email"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Invalid email format',
                            },
                        })}
                        className="
                            w-full p-2 text-white border border-gray-500 
                            rounded-md focus:outline-none
                        "
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="mt-6">
                    <label className="">
                        Password
                    </label>
                    <input
                        type="password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 8, message: 'Must be at least 8 characters' },
                            pattern: {
                                value: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message: 'Must include uppercase, number, and special character',
                            },
                        })}
                        className="w-full p-2 text-white border border-gray-500 rounded-md focus:outline-none"
                    />

                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full doom-action-btn mt-16"
                >
                    Sign Up
                </button>

                <div className="mt-6">
                    Have an account? <Link className="page-link" href="/login">Login</Link>
                </div>
            </form>
        }

        { signupState === "success" &&
            <SignupSuccessView 
                email={signupData?.user?.email || ""}
            />
        }
        </>
    )
}
