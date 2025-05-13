import Document, { Html, Head, Main, NextScript } from 'next/document'


class MyDocument extends Document {
  render() {
    const description = "Explore an archive of Doom ports showcasing how the game has been adapted to run on various devices, even those not originally intended for gaming."
    const title = "Can It Run Doom? An Archive of All Known Ports"

    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="description" content={description} />
          <meta name="robots" content="index, follow" />
          
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description}  />

          {/* <meta name="twitter:card" content="summary" /> */}
          {/* <meta name="twitter:title" content={title} /> */}
          {/* <meta name="twitter:description" content={description} /> */}
          {/* <meta name="twitter:image" content="https://canitrundoom.org/doom-placeholder.jpeg" /> */}
          <meta name="twitter:site" content="@gamehoundgames" />
          <meta name="twitter:creator" content="@gamehoundgames" />

          {/* <meta property="og:image" content="/doom-placeholder.jpeg" /> */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="canonical" href="https://www.canitrundoom.org/" />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": "Can It Run Doom? Archive of All Known Ports",
                "description": {description},
                "url": "https://canitrundoom.org",
                "image": "https://canitrundoom.org/doom-placeholder.jpeg",
                "publisher": {
                  "@type": "Organization",
                  "name": "Can It Run Doom?",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://canitrundoom.org/favicon.ico"
                  }
                }
              }),
            }}
          />
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
