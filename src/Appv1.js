import { useEffect, useState } from "react";

// Review reducer function of an array
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const key = "c50445b6";

function NavBar({ movies, query, setQuery }) {
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

function SelectedMovie({ selectedID, onBack }) {
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

  useEffect(
    function () {
      setIsLoading(true);
      async function getMovieDetail() {
        const res = await fetch(
          `http://www.omdbapi.com/?&apikey=${key}&i=${selectedID}`
        );
        if (!res.ok) {
          throw new Error("Details not Found");
        }
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetail();
    },
    //  Dependency array tracking changes in the useEffect function
    [selectedID]
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
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedID, setSelectedID] = useState(null);

  // Map function getting of array watched to grab ratings
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  // must revisit
  function onHandleClick(id) {
    setSelectedID((selectedID) => (selectedID === id ? null : id));
  }

  function onBack() {
    setSelectedID(null);
  }

  useEffect(
    function () {
      // must revisit
      setIsLoading(true);
      async function getMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?i=tt3896198&apikey=${key}&s=${query}`
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
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      getMovies();
    },
    [query]
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
            <SelectedMovie selectedID={selectedID} onBack={onBack} />
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
