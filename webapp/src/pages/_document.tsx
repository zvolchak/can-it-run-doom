import Document, { Html, Head, Main, NextScript } from 'next/document'


class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          

          {/* <meta name="twitter:card" content="summary" /> */}
          {/* <meta name="twitter:title" content={title} /> */}
          {/* <meta name="twitter:description" content={description} /> */}
          {/* <meta name="twitter:image" content="https://canitrundoom.org/doom-placeholder.jpeg" /> */}
          <meta name="twitter:site" content="@gamehoundgames" />
          <meta name="twitter:creator" content="@gamehoundgames" />

          {/* <meta property="og:image" content="/doom-placeholder.jpeg" /> */}
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <h1 className="hidden">Can It Run Doom? The Ultimate Doom Port Archive. Devices running Doom.</h1>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}


export default MyDocument
