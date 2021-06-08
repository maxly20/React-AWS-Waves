import { useState, useEffect } from 'react';

// AMPLIFY
import Amplify, { API, graphqlOperation, Storage } from 'aws-amplify';
import awsconfig from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { listSongs } from './graphql/queries';
import { updateSong } from './graphql/mutations';

// MATERIAL UI
import { IconButton } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PauseIcon from '@material-ui/icons/Pause';

// REACT PLAYER
import ReactPlayer from 'react-player';

// ========= MAIN ===========

Amplify.configure(awsconfig);

const App = () => {
  const [songs, setSongs] = useState([]);
  const [songPlaying, setSongPlaying] = useState('');
  const [audioURL, setAudioURL] = useState('');

  useEffect(() => {
    fetchSongs();
  }, []);

  const toggleSong = async idx => {
    if (songPlaying === idx) {
      setSongPlaying('');
      return;
    }
    const songFilePath = songs[idx].filePath;
    try {
      const fileAccessURL = await Storage.get(songFilePath, { expires: 60 });
      console.log('access url', fileAccessURL);
      setSongPlaying(idx);
      setAudioURL(fileAccessURL);
      return;
    } catch (error) {
      console.error('error accessing the file from S3', error);
      setAudioURL('');
      setSongPlaying('');
    }
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
              <div className='song__card__top'>
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
              </div>

              <div className='song__card__bottom'>
                {songPlaying === idx ? (
                  <ReactPlayer
                    url={audioURL}
                    controls
                    playing
                    height='60px'
                    onPause={() => toggleSong(idx)}
                  />
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default withAuthenticator(App);
