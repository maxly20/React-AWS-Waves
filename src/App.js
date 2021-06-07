import { useState, useEffect } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import awsconfig from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { listSongs } from './graphql/queries';

import { Paper, IconButton } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FavoriteIcon from '@material-ui/icons/Favorite';

Amplify.configure(awsconfig);

const App = () => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    fetchSongs();
  }, []);

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

  return (
    <div className='app'>
      <header className='app__header'>
        <AmplifySignOut />
        <h2>My App Content</h2>
      </header>
      <div className='songList'>
        {songs.map(song => {
          return (
            <Paper variant='outlined' elevation={2}>
              <div className='songCard'>
                <IconButton aria-label='play'>
                  <PlayArrowIcon />
                </IconButton>
                <div>
                  <div className='songTitle'>{song.title}</div>
                  <div className='songOwner'>{song.owner}</div>
                </div>
                <div>
                  <IconButton aria-label='like'>
                    <FavoriteIcon />
                  </IconButton>
                </div>
                <div className='songDescription'>{song.description}</div>
              </div>
            </Paper>
          );
        })}
      </div>
    </div>
  );
};

export default withAuthenticator(App);
