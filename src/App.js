import React, { Component } from 'react'
import { User } from './User'
import './App.css'

class App extends Component {
  constructor() {
    super();
      this.state = {
          name: null,
          imgUrl: null,
      }
      this.client_id = process.env.REACT_APP_GOOGLE_CLIENT_ID
  }

    async verify(client) {
        const ticket = await client.verifyIdToken({
            idToken: localStorage.getItem('gtoken'),
            audience: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        this.setState({
            name: payload.given_name,
            imgUrl: payload.picture,
             })
    }

    componentDidMount() {
      if(!localStorage.getItem('gtoken')){
        const _onInit = auth2 => {
            console.log('init OK', auth2)
        }
        const _onError = err => {
            console.log('error', err)
        }

        if(!window.gapi){
        return window.location.reload(false)
        }

        window.gapi.load('auth2', function() {
            window.gapi.auth2
                .init({
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                })
                .then(_onInit, _onError)
        })
      }
      else {
          const {OAuth2Client} = require('google-auth-library');
          const client = new OAuth2Client(this.client_id);
          this.verify(client).catch(console.error);
      }
    }

    signIn = () => {
        const auth2 = window.gapi.auth2.getAuthInstance()
        auth2.signIn().then(googleUser => {
            const profile = googleUser.getBasicProfile()

            console.log('ID: ' + profile.getId())
            console.log('Full Name: ' + profile.getName())
            console.log('Given Name: ' + profile.getGivenName())
            console.log('Family Name: ' + profile.getFamilyName())
            console.log('Image URL: ' + profile.getImageUrl())
            console.log('Email: ' + profile.getEmail())

            const id_token = googleUser.getAuthResponse().id_token
            console.log('ID Token: ' + id_token)

            localStorage.setItem('gtoken',id_token)

            this.setState({
                name: profile.getName(),
                imgUrl: profile.getImageUrl(),
            })
        })
    }

    cleanUser = () => {
        localStorage.removeItem('gtoken')
        this.setState({
            name: null,
            imgUrl: null
        })
        if(!window.gapi.auth2){
            return window.location.reload(false)
        }
    }

    signOut = () => {
        if(window.gapi.auth2) {
            const auth2 = window.gapi.auth2.getAuthInstance()
            auth2.signOut().then(() => {
                this.cleanUser()
            })
        }else {this.cleanUser()}
    }

    render() {
        const { name, imgUrl } = this.state
        return (
            <div className="App">
                <header className="App-header">
                    {!name && <button onClick={this.signIn}>Log in</button>}
                    {!!name && <button onClick={this.signOut}>Log out</button>}
                    {!!name && <User name={name} imgUrl={imgUrl} />}
                </header>
            </div>
        )
    }
}

export default App