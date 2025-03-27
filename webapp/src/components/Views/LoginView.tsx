import { useForm } from "react-hook-form"
import { useState } from "react"
import { useDispatch, } from "react-redux"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import {
    loginWithEmailAndPassword,
} from "@/src/api"
import {
    setUserData,
} from "@/src/store"
import {
    IsSessionExpired,
} from "@/src/utils"


interface LoginForm {
    email: string
    password: string
}


interface LoginViewProps {
    className?: string
}

export function LoginView({
    className = "",
}: LoginViewProps) {
    const dispatch = useDispatch()
    const router = useRouter()
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()
    const [errorMessage, setErrorMessage] = useState("")


    async function onSubmit(data) {
        const userCookie = Cookies.get("user")
        let user = (userCookie && JSON.parse(userCookie)) || null

        if (!user || IsSessionExpired()) {
            const userData = await loginWithEmailAndPassword(data.email, data.password)
            if (!userData?.user) {
                setErrorMessage("Login failed")
                return
            }
            user = {
                id: userData.user.id,
                email: userData.user.email,
                isVerified: userData.user.isVerified,
                sessionExpiresOn: userData.user.sessionExpiresOn,
            }
            Cookies.set("user", JSON.stringify(user), {
                expires: new Date(user.sessionExpiresOn),
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
            })
        }

        dispatch(setUserData(user))

        router.push("/")
    } // onSubmit


    return (
            <form
                onSubmit={handleSubmit(onSubmit)}
                className={`w-1/3 text-gray-300 ${className}`}
            >
                <h2 className="title text-center mb-4">Login</h2>

                {errorMessage && (
                    <p className="text-red-500 text-center mb-4">
                        {errorMessage}
                    </p>
                )}

                <div className="mb-4">
                    <label className="block  font-medium">
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
                    <label className="block font-medium">
                        Password
                    </label>
                    <input
                        type="password"
                        {...register('password', {
                            required: 'Password is required'
                        })}
                        className="
                            w-full p-2 text-white border border-gray-500 
                            rounded-md focus:outline-none
                        "
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    className="w-full doom-action-btn mt-16"
                >
                    Login
                </button>

                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="px-4 text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <button
                    type="button"
                    className="w-full doom-secondary-btn"
                    onClick={() => router.push("/signup")}
                >
                    Sign Up
                </button>
            </form>
    )
}
