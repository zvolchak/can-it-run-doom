import { ExplainerPage, type ExplainerTag } from "@/src/components/Views/ExplainerPage"
import { EXPLAINER_PT } from "@/src/content/explainer"

export { explainerProps as getServerSideProps } from "@/src/utils/explainerServer"

export default function PorQueDoomRodaEmTudo(props: { tags: ExplainerTag[], total: number }) {
    return <ExplainerPage content={EXPLAINER_PT} {...props} />
}
