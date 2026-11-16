import Head from "next/head"
import { SITE_URL, jsonLdString } from "@/src/utils/seo"
import { tagPath } from "@/src/utils/tagPages"
import { EXPLAINER_EN, EXPLAINER_PT, type ExplainerContent } from "@/src/content/explainer"

export interface ExplainerTag { slug: string, label: string, count: number }

interface ExplainerPageProps {
    content: ExplainerContent
    tags: ExplainerTag[]
    total: number
}

/** Both language versions announce each other so Google serves the right one. */
export function ExplainerPage({ content, tags, total }: ExplainerPageProps) {
    const url = `${SITE_URL}${content.path}`
    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: content.faq.map(entry => ({
            "@type": "Question", name: entry.question,
            acceptedAnswer: { "@type": "Answer", text: entry.answer },
        })),
    }
    const articleLd = {
        "@context": "https://schema.org", "@type": "Article", headline: content.heading,
        description: content.description, inLanguage: content.lang, url,
        publisher: { "@type": "Organization", name: "Can It Run Doom?", url: SITE_URL },
    }
    return (
        <>
            <Head>
                <title>{content.title}</title>
                <meta name="description" content={content.description} key="description" />
                <meta property="og:title" content={content.title} key="og:title" />
                <meta property="og:description" content={content.description} key="og:description" />
                <link rel="canonical" href={url} key="canonical" />
                <link rel="alternate" hrefLang="en" href={`${SITE_URL}${EXPLAINER_EN.path}`} />
                <link rel="alternate" hrefLang="pt-BR" href={`${SITE_URL}${EXPLAINER_PT.path}`} />
                <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${EXPLAINER_EN.path}`} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(articleLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqLd) }} />
            </Head>
            <main lang={content.lang} className="mx-auto w-full max-w-3xl p-4 text-foreground">
                <h1 className="title text-3xl mb-4">{content.heading}</h1>
                <p className="text-xl mb-8">{content.answer}</p>
                {content.sections.map(section => (
                    <section key={section.heading} className="mb-8">
                        <h2 className="text-2xl mb-2">{section.heading}</h2>
                        {section.paragraphs.map(text => <p key={text} className="mb-3">{text}</p>)}
                    </section>
                ))}
                <section className="mb-8">
                    <h2 className="text-2xl mb-2">FAQ</h2>
                    {content.faq.map(entry => (
                        <div key={entry.question} className="mb-3">
                            <h3 className="text-lg font-bold">{entry.question}</h3>
                            <p>{entry.answer}</p>
                        </div>
                    ))}
                </section>
                {tags.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-2xl mb-2">{content.tagsHeading}</h2>
                        <ul className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <li key={tag.slug}><a className="project-tags__filter" href={tagPath(tag.slug)}>{content.tagLink(tag.label, tag.count)}</a></li>
                            ))}
                        </ul>
                    </section>
                )}
                <a className="doom-btn-secondary inline-block px-4 py-2" href="/">
                    {content.browseLabel}{total > 0 ? ` (${total})` : ""}
                </a>
            </main>
        </>
    )
}
