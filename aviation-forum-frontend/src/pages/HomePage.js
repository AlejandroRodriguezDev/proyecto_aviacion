import React, { useState, useEffect } from 'react';
import PostCard from '../components/Post/PostCard';
import ForumCard from '../components/Forum/ForumCard';
// import { api } from '../services/api'; // Placeholder para API
import { useAuth } from '../hooks/useAuth';
import styles from './HomePage.module.css'; // Crear este archivo CSS
import LoadingSpinner from '../components/Common/LoadingSpinner';

// --- Mock Data --- (Reemplazar con llamadas a API)
const mockFeedPosts = [
  { id: 'p1', title: 'Primer vuelo solo!', description: '¡Hoy completé mi primer vuelo solo en un Cessna 172! Una experiencia increíble.', user: { username: 'PilotPete', avatarUrl: null }, forum: { id: 'f1', name: 'General Aviation' }, likes: 25, dislikes: 1, commentCount: 5, createdAt: '2023-10-26T10:00:00Z' },
  { id: 'p2', title: '¿Mejor simulador de vuelo 2023?', description: 'Estoy buscando recomendaciones para un simulador de vuelo realista para PC. ¿MSFS 2020 sigue siendo el rey?', user: { username: 'SimAviator', avatarUrl: null }, forum: { id: 'f2', name: 'Flight Simulators' }, likes: 40, dislikes: 3, commentCount: 15, createdAt: '2023-10-25T14:30:00Z' },
  { id: 'p3', title: 'Avistamiento de A380 en EZE', description: '¡Vi el A380 de Emirates aterrizando hoy en Ezeiza! Impresionante.', user: { username: 'SpotterArg', avatarUrl: null }, forum: { id: 'f3', name: 'Argentina Aviation' }, likes: 18, dislikes: 0, commentCount: 3, createdAt: '2023-10-26T12:00:00Z' },
];

const mockRecommendedForums = [
  { id: 'f4', name: 'Air Traffic Control', description: 'Discusiones sobre ATC, procedimientos y carrera.', memberCount: 1200, bannerUrl: null },
  { id: 'f5', name: 'Aviation Photography', description: 'Comparte tus mejores fotos de aviones.', memberCount: 2500, bannerUrl: null },
  { id: 'f6', name: 'Pilot Training (PPL/CPL)', description: 'Preguntas y consejos para estudiantes de piloto.', memberCount: 3000, bannerUrl: null },
];
// --- Fin Mock Data ---

const HomePage = () => {
  const { user } = useAuth();
  const [feedPosts, setFeedPosts] = useState([]);
  const [recommendedForums, setRecommendedForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // TODO: Llamar a la API para obtener posts del feed (amigos, suscripciones)
        // const posts = await api.getHomeFeed();
        // setFeedPosts(posts);
        setFeedPosts(mockFeedPosts); // Usar datos mock

        // TODO: Llamar a la API para obtener foros recomendados
        // const forums = await api.getRecommendedForums();
        // setRecommendedForums(forums);
        setRecommendedForums(mockRecommendedForums); // Usar datos mock

      } catch (err) {
        console.error("Error fetching home data:", err);
        setError('No se pudo cargar el contenido. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (user) { // Solo cargar datos si el usuario está logueado
        fetchData();
    }

  }, [user]); // Volver a cargar si el usuario cambia

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
      return <p className={styles.errorMessage}>{error}</p>;
  }

  return (
    <div className={styles.homeLayout}>
      <div className={styles.feedContainer}>
        <h2>Tu Feed</h2>
        {feedPosts.length === 0 && <p>Tu feed está vacío. ¡Suscríbete a foros o agrega amigos!</p>}
        {feedPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <aside className={styles.sidebar}>
        <h2>Foros Recomendados</h2>
        {recommendedForums.map(forum => (
          <ForumCard key={forum.id} forum={forum} variant="recommendation" />
        ))}
        {/* Aquí podrías añadir otras secciones del sidebar si es necesario */}
      </aside>
    </div>
  );
};

export default HomePage;