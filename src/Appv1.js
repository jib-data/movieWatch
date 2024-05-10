import { useEffect, useRef, useState } from "react";
import { useMovies } from "./useMovies";
const key = "c50445b6";
// Review reducer function of an array
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function NavBar({ movies, query, setQuery }) {
  const inputEl = useRef(null);
  useEffect(
    function () {
      function focusInput(e) {
        if (document.activeElement === inputEl) {
          return;
        } else if (e.key === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keydown", focusInput);
    },
    [setQuery]
  );

  return (
    <nav className="nav-bar">
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
      />
      <p className="num-results">
        Found <strong>{movies.length}</strong> results
      </p>
    </nav>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

// Rendering list
function MovieList({ movies, onHandleClick }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <li key={movie.imdbID} onClick={() => onHandleClick(movie.imdbID)}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>🗓</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Summary({ watched, avgImdbRating, avgRuntime, avgUserRating }) {
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}
function Error({ message }) {
  return <p className="error">❌{message}❌</p>;
}

function SelectedMovie({ selectedID, onBack, onAddMovie }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Destructuring an object to get the elemens we need fromthe movie data object that was fetched from the OMDb site
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedID,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ")[0]),
    };
    onAddMovie(newWatchedMovie);
  }

  useEffect(
    function () {
      setIsLoading(true);
      const controller = new AbortController();
      async function getMovieDetail() {
        const res = await fetch(
          `http://www.omdbapi.com/?&apikey=${key}&i=${selectedID}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error("Details not Found");
        }
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetail();

      return function () {
        // controller.abort();
      };
    },
    //  Dependency array tracking changes in the useEffect function
    [selectedID]
  );

  useEffect(() => {
    if (!title) {
      return;
    } else {
      document.title = `Movie | ${title}`;
    }

    // Cleaning up the useEffect
    return function () {
      document.title = "usePopcorn";
    };
  }, [title]);

  useEffect(
    function () {
      function addEscape(e) {
        if (e.key === "Escape") {
          onBack();
        }
      }
      document.addEventListener("keydown", addEscape);
      return function () {
        document.removeEventListener("keydown", addEscape);
      };
    },
    [onBack]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onBack}>
              👈
            </button>
            <img src={poster} alt={`Poster of {movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>⭐</p>
              {imdbRating} IMDb rating
            </div>
          </header>
          <section>
            <div>
              <button className="btn-add" onClick={handleAdd}>
                + Add to list
              </button>
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [watched, setWatched] = useState([]);

  const [selectedID, setSelectedID] = useState(null);

  // Map function getting of array watched to grab ratings
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  const { movies, isLoading, error } = useMovies(query, onBack);

  // must revisit
  function onHandleClick(id) {
    setSelectedID((selectedID) => (selectedID === id ? null : id));
  }

  function onBack() {
    setSelectedID(null);
  }

  function HandleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  useEffect(
    function () {
      localStorage.setItem("movies", JSON.stringify(movies));
    },
    [movies]
  );

  return (
    <>
      <NavBar movies={movies} query={query} setQuery={setQuery} />
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onHandleClick={onHandleClick} />
          )}
          {error && <Error message={error} />}
        </Box>
        <Box>
          {selectedID ? (
            <SelectedMovie
              selectedID={selectedID}
              onBack={onBack}
              onAddMovie={HandleAddWatched}
            />
          ) : (
            <>
              <Summary
                watched={watched}
                avgImdbRating={avgImdbRating}
                avgRuntime={avgRuntime}
                avgUserRating={avgUserRating}
              />
              <MovieList movies={watched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
