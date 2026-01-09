import { useState, useEffect } from 'react'
import './App.css'

const API_URL = '/api'

function App() {
  const [movies, setMovies] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [profiles, setProfiles] = useState([])
  const [currentProfile, setCurrentProfile] = useState(null)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProfileSelector, setShowProfileSelector] = useState(true)

  useEffect(() => {
    fetchMovies()
    fetchProfiles()
  }, [])

  useEffect(() => {
    if (currentProfile) {
      fetchWatchlist()
    }
  }, [currentProfile])

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${API_URL}/movies`)
      const data = await res.json()
      setMovies(data)
    } catch (err) {
      console.error('Error fetching movies:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_URL}/profiles`)
      const data = await res.json()
      setProfiles(data)
    } catch (err) {
      console.error('Error fetching profiles:', err)
    }
  }

  const fetchWatchlist = async () => {
    try {
      const res = await fetch(`${API_URL}/watchlist`)
      const data = await res.json()
      setWatchlist(data)
    } catch (err) {
      console.error('Error fetching watchlist:', err)
    }
  }

  const handleSearch = async () => {
    try {
      const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data)
    } catch (err) {
      console.error('Error searching:', err)
    }
  }

  const addToWatchlist = async (movieId) => {
    try {
      const res = await fetch(`${API_URL}/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, profileId: currentProfile?.id })
      })
      if (res.ok) {
        fetchWatchlist()
      }
    } catch (err) {
      console.error('Error adding to watchlist:', err)
    }
  }

  const removeFromWatchlist = async (movieId) => {
    try {
      await fetch(`${API_URL}/watchlist/movie/${movieId}?profileId=${currentProfile?.id}`, {
        method: 'DELETE'
      })
      fetchWatchlist()
    } catch (err) {
      console.error('Error removing from watchlist:', err)
    }
  }

  const isInWatchlist = (movieId) => {
    return watchlist.some(item => item.movie?.id === movieId)
  }

  const getMoviesByCategory = (category) => {
    return movies.filter(m => m.category === category)
  }

  const selectProfile = (profile) => {
    setCurrentProfile(profile)
    setShowProfileSelector(false)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading NovaStream...</p>
      </div>
    )
  }

  if (showProfileSelector) {
    return (
      <div className="profile-selector">
        <div className="profile-selector-content">
          <h1>Who's watching?</h1>
          <div className="profile-grid">
            {profiles.map(profile => (
              <div
                key={profile.id}
                className="profile-card"
                onClick={() => selectProfile(profile)}
              >
                <div className="profile-avatar" style={{ backgroundColor: profile.color }}>
                  {profile.avatar}
                </div>
                <p>{profile.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const featuredMovie = movies.find(m => m.featured) || movies[0]

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="logo">NOVASTREAM</h1>
          <div className="nav-links">
            <a href="#" className="active">Home</a>
            <a href="#trending">Trending</a>
            <a href="#new">New Releases</a>
            <a href="#watchlist">My List</a>
          </div>
        </div>
        <div className="nav-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>
          <div className="profile-menu" onClick={() => setShowProfileSelector(true)}>
            <div className="profile-avatar-small" style={{ backgroundColor: currentProfile?.color }}>
              {currentProfile?.avatar}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <h2>Search Results for "{searchQuery}"</h2>
          <div className="movie-grid">
            {searchResults.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={setSelectedMovie}
                onAddToWatchlist={addToWatchlist}
                onRemoveFromWatchlist={removeFromWatchlist}
                isInWatchlist={isInWatchlist(movie.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hero Section */}
      {!searchQuery && featuredMovie && (
        <div className="hero" style={{ backgroundImage: `url(${featuredMovie.thumbnail})` }}>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">{featuredMovie.title}</h1>
            <div className="hero-meta">
              <span className="rating">★ {featuredMovie.rating}</span>
              <span>{featuredMovie.year}</span>
              <span>{featuredMovie.duration}</span>
              <span className="genre-badge">{featuredMovie.genre}</span>
            </div>
            <p className="hero-description">{featuredMovie.description}</p>
            <div className="hero-buttons">
              <button className="btn-play" onClick={() => setSelectedMovie(featuredMovie)}>
                <span className="play-icon">▶</span> Play
              </button>
              {isInWatchlist(featuredMovie.id) ? (
                <button className="btn-secondary" onClick={() => removeFromWatchlist(featuredMovie.id)}>
                  <span>✓</span> In My List
                </button>
              ) : (
                <button className="btn-secondary" onClick={() => addToWatchlist(featuredMovie.id)}>
                  <span>+</span> My List
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Rows */}
      {!searchQuery && (
        <div className="content">
          <MovieRow
            title="Trending Now"
            movies={getMoviesByCategory('trending')}
            onSelectMovie={setSelectedMovie}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            isInWatchlist={isInWatchlist}
          />
          <MovieRow
            title="New Releases"
            movies={getMoviesByCategory('new')}
            onSelectMovie={setSelectedMovie}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            isInWatchlist={isInWatchlist}
          />
          <MovieRow
            title="Action & Adventure"
            movies={getMoviesByCategory('action')}
            onSelectMovie={setSelectedMovie}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            isInWatchlist={isInWatchlist}
          />
          <MovieRow
            title="Sci-Fi Collection"
            movies={getMoviesByCategory('scifi')}
            onSelectMovie={setSelectedMovie}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            isInWatchlist={isInWatchlist}
          />
          <MovieRow
            title="Drama & Romance"
            movies={getMoviesByCategory('drama')}
            onSelectMovie={setSelectedMovie}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            isInWatchlist={isInWatchlist}
          />
          <MovieRow
            title="Comedy"
            movies={getMoviesByCategory('comedy')}
            onSelectMovie={setSelectedMovie}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            isInWatchlist={isInWatchlist}
          />
          <MovieRow
            title="Horror & Thriller"
            movies={getMoviesByCategory('horror')}
            onSelectMovie={setSelectedMovie}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            isInWatchlist={isInWatchlist}
          />
          <MovieRow
            title="Documentaries"
            movies={getMoviesByCategory('documentaries')}
            onSelectMovie={setSelectedMovie}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            isInWatchlist={isInWatchlist}
          />

          {watchlist.length > 0 && (
            <div id="watchlist">
              <MovieRow
                title="My Watchlist"
                movies={watchlist.map(item => item.movie)}
                onSelectMovie={setSelectedMovie}
                onAddToWatchlist={addToWatchlist}
                onRemoveFromWatchlist={removeFromWatchlist}
                isInWatchlist={isInWatchlist}
              />
            </div>
          )}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedMovie && (
        <VideoPlayer
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  )
}

function MovieRow({ title, movies, onSelectMovie, onAddToWatchlist, onRemoveFromWatchlist, isInWatchlist }) {
  if (movies.length === 0) return null

  return (
    <div className="movie-row">
      <h2 className="row-title">{title}</h2>
      <div className="row-posters">
        {movies.map(movie => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onSelect={onSelectMovie}
            onAddToWatchlist={onAddToWatchlist}
            onRemoveFromWatchlist={onRemoveFromWatchlist}
            isInWatchlist={isInWatchlist(movie.id)}
          />
        ))}
      </div>
    </div>
  )
}

function MovieCard({ movie, onSelect, onAddToWatchlist, onRemoveFromWatchlist, isInWatchlist }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`movie-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={movie.thumbnail} alt={movie.title} className="movie-poster" />
      {isHovered && (
        <div className="movie-card-overlay">
          <h3>{movie.title}</h3>
          <div className="movie-meta">
            <span className="rating">★ {movie.rating}</span>
            <span>{movie.year}</span>
            <span>{movie.duration}</span>
          </div>
          <p className="movie-description">{movie.description.substring(0, 100)}...</p>
          <div className="movie-actions">
            <button className="btn-play-small" onClick={() => onSelect(movie)}>
              <span>▶</span> Play
            </button>
            {isInWatchlist ? (
              <button className="btn-icon" onClick={() => onRemoveFromWatchlist(movie.id)} title="Remove from watchlist">
                <span>✓</span>
              </button>
            ) : (
              <button className="btn-icon" onClick={() => onAddToWatchlist(movie.id)} title="Add to watchlist">
                <span>+</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function VideoPlayer({ movie, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 100
          }
          return prev + 0.5
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div className="video-player-modal" onClick={onClose}>
      <div className="video-player" onClick={(e) => e.stopPropagation()}>
        <button className="close-player" onClick={onClose}>×</button>

        <div className="video-screen" style={{ backgroundImage: `url(${movie.thumbnail})` }}>
          <div className="video-overlay">
            {!isPlaying && (
              <button className="play-button-large" onClick={() => setIsPlaying(true)}>
                <span>▶</span>
              </button>
            )}
            {isPlaying && (
              <div className="playing-indicator">
                <div className="pulse"></div>
              </div>
            )}
          </div>
        </div>

        <div className="player-controls">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="controls-row">
            <div className="controls-left">
              <button onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <span className="time">{Math.floor(progress)}% watched</span>
            </div>
            <div className="controls-right">
              <button>🔊</button>
              <button>⚙️</button>
              <button>⛶</button>
            </div>
          </div>
        </div>

        <div className="player-info">
          <h2>{movie.title}</h2>
          <div className="player-meta">
            <span className="rating">★ {movie.rating}</span>
            <span>{movie.year}</span>
            <span>{movie.duration}</span>
            <span className="genre-badge">{movie.genre}</span>
          </div>
          <p>{movie.description}</p>
        </div>
      </div>
    </div>
  )
}

export default App
