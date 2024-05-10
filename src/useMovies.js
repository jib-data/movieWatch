//  Creating a custom hook!

import { useState, useEffect } from "react";
const key = "c50445b6";

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    function () {
      // must revisit
      setIsLoading(true);
      const controller = new AbortController();
      async function getMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?i=tt3896198&apikey=${key}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error("Could not fetch movies");
          }
          const data = await res.json();

          if (data.Response === "False") {
            throw new Error("Movie Not Found");
          }
          if (data.Search === undefined) {
            setMovies([]);
          } else {
            setMovies(data.Search);
            setError("");
          }
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      // remove the movie details
      callback();
      getMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, error, isLoading, callback };
}
