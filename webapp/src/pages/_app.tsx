import "@/src/styles/globals.scss"
import { Provider, } from "react-redux"
import { 
    store,
} from "@/src/store"


function App({ Component, pageProps }) {
    const getLayout = Component.getLayout || ((page) => page)

    return (
        <Provider store={store}>
            {getLayout(
                <Component {...pageProps} />
            )}
        </Provider>
    )
}

export default App
