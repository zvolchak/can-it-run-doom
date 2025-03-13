import { ReactElement } from "react"


const MainLayout = ({ children }) => {
    return (
        <div className="w-full md:w-2/3 h-screen scrollbar-hidden p-4">
            {children}
        </div>
    )
} // MainLayout


export function getMainLayout(page: ReactElement) {
    return <MainLayout>{page}</MainLayout>
} // getLayout


export default MainLayout
