// app/collection/screen/test/show/page.tsx
// Renders ShowDetail with mock fixtures.
import ShowDetail from "@/components/screen/slugs/ShowDetail";
import { MOCK_SHOW, MOCK_CAST, MOCK_CREW } from "../mockData";

export const metadata = { title: "Show Detail — Preview" };

const SHOW_GENRES = [{ name: "Crime" }, { name: "Mystery" }, { name: "Drama" }];

export default function TestShowPage() {
  return (
    <ShowDetail
      show={MOCK_SHOW as unknown as ShowDetail}
      cast={MOCK_CAST as unknown as ShowCastMember[]}
      crew={MOCK_CREW as unknown as ShowCrewMember[]}
      genres={SHOW_GENRES}
    />
  );
}
