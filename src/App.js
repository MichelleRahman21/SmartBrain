import React, { Component } from 'react';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Clarifai from 'clarifai';

import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register'
import Rank from './components/Rank/Rank';

import './App.css';

const app = new Clarifai.App({
  apiKey:'7b91f5b5c1d047b48ce73791549aed1d'
});

const particlesOptions = {
     particles: {
     number: {
      value: 190,
      density: {
      enable: true,
      value_area: 800
      }
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin'
    }
}

calculateFaceLocation = (data) => {
  const clarifaiFace =  data.outputs[0].data.regions[0].region_info.bounding_box;
  const image = document.getElementById('inputimage');
  const width = Number(image.width);
  const height = Number(image.height);

  return {
    leftCol: clarifaiFace.left_col * width,
    topRow: clarifaiFace.top_row * height,
    rightCol: width - (clarifaiFace.right_col * width),
    bottomRow: height -(clarifaiFace.bottom_row * height)
  }
}

displayFaceBox = (box) => {
  this.setState({box: box});
}


onInputChange = (event) => {
  this.setState({input: event.target.value});
}

onButtonSubmit = () => {
   this.setState({imageUrl: this.state.input});
   app.models
     .predict(
       Clarifai.FACE_DETECT_MODEL,
       this.state.input)
     .then(response => {
       if (response) {
         fetch('http://localhost:3000/image', {
           method: 'put',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({
             id: this.state.user.id
           })
         })
           .then(response => response.json())
           .then(count => {
             this.setState(Object.assign(this.state.user, { entries: count}))
           })

       }
       this.displayFaceBox(this.calculateFaceLocation(response))
     })
     .catch(err => console.log(err));
 }

onRouteChange = (route) => {
  this.setState({route: route});
}

  render() {
  return (
    <div className="App">
      <Particles className='particles' params={particlesOptions} />
      <Navigation onRouteChange={this.onRouteChange}/>
        { this.state.route === 'home'
          ? <div>
              <Logo />
              <Rank />
              <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
            </div>
      : (
        this.state.route === 'signin'
        ? <Signin onRouteChange={this.onRouteChange} />
          <Register onRouteChange={this.onRouteChange} />
        )
 }
 </div>
}

export default App;
