import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import t from './common/localization';

const useStyles = makeStyles(theme => ({
  root: {
    width: 'auto',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    [theme.breakpoints.up(400 + theme.spacing(3 * 2))]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3),
  },
  logo: {
    margin: theme.spacing(2)
  },
  buttons: {
    marginTop: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-evenly',
    '& > *': {
      flexBasis: '40%',
    },
    textAlign: 'center'
  },
}));

const RegisterPage = () => {
  const [failed, setFailed] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const classes = useStyles();
  const history = useHistory();

  const handleNameChange = (event) => {
    setName(event.target.value);
  }

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  }

  const handleRegister = async (event) => {
    event.preventDefault();
    const data = {
        name: name,
        email: email,
        password: password
    }
    const response = await fetch('/api/users', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) 
    });
    if (response.ok) {
      history.replace('/login');
    } else {
      setFailed(true);
      setPassword('');
    }
  }

  const gotoLogin = (e) => {
    e.preventDefault()
    history.replace('login')
  }

  return (
    <main className={classes.root}>
      <Paper className={classes.paper}>
        <img className={classes.logo} src='/logo.png' alt='Geolynx' />
        <Typography variant="h5" gutterBottom style={{marginBottom:0}}>Register</Typography>
        <form onSubmit={handleRegister}>
          <TextField
            margin='normal'
            required
            fullWidth
            error={failed}
            label={t('userName')}
            name='name'
            value={name}
            autoFocus
            onChange={handleNameChange}
            helperText={failed && 'Invalid name'} />

          <TextField
            margin='normal'
            required
            fullWidth
            error={failed}
            label={t('userEmail')}
            name='email'
            value={email}
            onChange={handleEmailChange}
            helperText={failed && 'Invalid email'} />

          <TextField
            margin='normal'
            required
            fullWidth
            error={failed}
            label={t('userPassword')}
            name='password'
            value={password}
            type='password'
            onChange={handlePasswordChange}
            helperText={failed && 'Invalid password'} />

          <FormControl fullWidth margin='normal'>
            <div className={classes.buttons}>
              <Typography>
                <Link href="#" onClick={gotoLogin}>{t('loginLogin')}</Link>
              </Typography>
              <Button type='submit' variant='contained' color='primary'>
                {t('loginRegister')}
              </Button>
            </div>
          </FormControl>
        </form>
      </Paper>
    </main>
  );
}

export default RegisterPage;
