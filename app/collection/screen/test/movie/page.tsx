// app/collection/screen/test/movie/page.tsx
// Renders MovieDetail with mock fixtures.
import MovieDetail from "@/components/screen/slugs/MovieDetail";
import { MOCK_MOVIE, MOCK_CAST, MOCK_CREW, MOCK_GENRES_MULTI } from "../mockData";

export const metadata = { title: "Movie Detail — Preview" };

export default function TestMoviePage() {
  return (
    <MovieDetail
      movie={MOCK_MOVIE as unknown as MovieDetail}
      cast={MOCK_CAST as unknown as MovieCastMember[]}
      crew={MOCK_CREW as unknown as MovieCrewMember[]}
      genres={MOCK_GENRES_MULTI}
    />
  );
}
