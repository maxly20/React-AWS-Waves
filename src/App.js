import { useState, useEffect } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import awsconfig from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { listSongs } from './graphql/queries';
import { updateSong } from './graphql/mutations';

import { IconButton } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PauseIcon from '@material-ui/icons/Pause';

Amplify.configure(awsconfig);

const App = () => {
  const [songs, setSongs] = useState([]);
  const [songPlaying, setSongPlaying] = useState('');

  useEffect(() => {
    fetchSongs();
  }, []);

  const toggleSong = async idx => {
    if (songPlaying === idx) {
      setSongPlaying('');
      return;
    }
    setSongPlaying(idx);
    return;
  };

  const fetchSongs = async () => {
    try {
      const songData = await API.graphql(graphqlOperation(listSongs));
      const songList = songData.data.listSongs.items;
      console.log('song list', songList);
      setSongs(songList);
    } catch (error) {
      console.log('error on fetching songs', error);
    }
  };

  const addLike = async idx => {
    try {
      const song = songs[idx];
      song.like = song.like + 1;
      delete song.createdAt;
      delete song.updatedAt;

      const songData = await API.graphql(
        graphqlOperation(updateSong, { input: song })
      );
      const songList = [...songs];
      songList[idx] = songData.data.updateSong;
      setSongs(songList);
    } catch (error) {
      console.log('error on adding like to song', error);
    }
  };

  return (
    <div className='app'>
      <nav className='navbar'>
        <h2 className='logo'>WAVES</h2>
        <AmplifySignOut />
      </nav>
      <section className='songList'>
        {songs.map((song, idx) => {
          return (
            <article className='song__card' key={`song${idx}`}>
              <div className='play__button'>
                <IconButton aria-label='play' onClick={() => toggleSong(idx)}>
                  {songPlaying === idx ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
              </div>

              <div className='song__title'>{song.name}</div>
              <div className='song__owner'>{song.owner}</div>

              <div className='like__button'>
                <IconButton aria-label='like' onClick={() => addLike(idx)}>
                  <FavoriteIcon />
                </IconButton>
                {song.like}
              </div>
              <div className='song__desc'>{song.description}</div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default withAuthenticator(App);
