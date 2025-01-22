import Document, { Html, Head, Main, NextScript } from 'next/document'


class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="description" content="Explore a comprehensive archive of Doom ports created by the community. This collection showcases how Doom has been adapted to run on various devices, including those not originally intended for gaming." />
          <meta name="robots" content="index, follow" />
          <meta property="og:title" content="Can it run doom?" />
          <meta property="og:description" content="Explore a comprehensive archive of Doom ports created by the community. This collection showcases how Doom has been adapted to run on various devices, including those not originally intended for gaming."  />
          <meta property="og:image" content="/doom-placeholder.jpeg" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}


export default MyDocument
