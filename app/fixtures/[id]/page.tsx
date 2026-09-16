import { FixtureDetail } from "@/components/fixture-detail";

export default async function FixturePage(props: PageProps<"/fixtures/[id]">) {
  const { id } = await props.params;
  return <FixtureDetail fixtureId={Number(id)} />;
}
