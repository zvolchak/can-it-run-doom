import { ExplainerPage, type ExplainerTag } from "@/src/components/Views/ExplainerPage"
import { EXPLAINER_EN } from "@/src/content/explainer"

export { explainerProps as getServerSideProps } from "@/src/utils/explainerServer"

export default function WhyDoomRunsOnEverything(props: { tags: ExplainerTag[], total: number }) {
    return <ExplainerPage content={EXPLAINER_EN} {...props} />
}
