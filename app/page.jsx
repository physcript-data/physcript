import Hero from "../components/Hero";

/* Server component. Hero is a client component, so it still hydrates and runs
   its interaction code — but its markup is now present in the initial HTML,
   which it was not while the whole page was loaded with ssr disabled. */
export default function Page() {
  return <Hero />;
}
