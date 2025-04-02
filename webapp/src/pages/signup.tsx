import {
    SignupView,
} from "@/src/components"
import { getMainLayout } from "@/src/layouts"


export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-start justify-center">
            <SignupView className="mt-20" />
        </div>
    )
} // LoginPage


SignupPage.getLayout = getMainLayout
