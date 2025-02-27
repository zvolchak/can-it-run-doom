'use client'

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


export function LoginView() {
    const dispatch = useDispatch()
    const router = useRouter()
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [errorMessage, setErrorMessage] = useState("")


    async function onSubmit(data) {
        let user = JSON.parse(Cookies.get("user"))

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
        <div className="">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="doom-card p-6 rounded-md shadow-md w-full max-w-md border border-gray-600"
            >
                <h2 className="title text-center mb-4">Login</h2>

                {errorMessage && (
                    <p className="text-red-500 text-center mb-4">
                        {errorMessage}
                    </p>
                )}

                <div className="mb-4">
                    <label className="block text-gray-300 font-medium">
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
                            w-full p-2 bg-gray-700 text-white border border-gray-500 
                            rounded-md focus:outline-none
                        "
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 font-medium">
                        Password
                    </label>
                    <input
                        type="password"
                        {...register('password', {
                            required: 'Password is required'
                        })}
                        className="
                            w-full p-2 bg-gray-700 text-white border border-gray-500 
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
                    type="submit"
                    className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-150"
                >
                    Login
                </button>
            </form>
        </div>
    )
}
