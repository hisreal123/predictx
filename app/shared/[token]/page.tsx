import { SharedPrediction } from "@/components/shared-prediction";

export default async function SharedPage(props: PageProps<"/shared/[token]">) {
  const { token } = await props.params;
  return <SharedPrediction token={token} />;
}
