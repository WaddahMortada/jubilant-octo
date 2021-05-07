import React, { Component } from 'react';
import { Platform, Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
// import Geocoder from 'react-native-geocoder'
import moment from 'moment';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' + 'Shake or press menu button for dev menu',
});

export default class App extends Component {
  state = {
    isLoading: true,
    coords: null,
    astronomyData: null,
    address: null
  };

  componentDidMount = () => {
    this.getCurrentLoction()
  }

  componentDidUpdate = () => {
    if (this.state.coords !== null) {
      if (this.state.address === null) {
        this.getAddress()
      }
      if (this.state.isLoading === true) {
        this.getAstronomyInfo()
      }
    }
  }

  getAddress = () => {
    // https://api.postcodes.io/postcodes?lon=-2.3205&lat=53.4908
    // https://api.postcodes.io/postcodes?lon=${this.state.coords.latitude}&lat=${this.state.coords.longitude}
    fetch(`https://api.postcodes.io/postcodes?lon=-2.3205&lat=53.4908`)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.result && typeof(responseJson.result[0]) === 'object') {
          const address = {
            postcode: responseJson.result[0].postcode,
            city: responseJson.result[0].admin_district,
            country: responseJson.result[0].country,
            region: responseJson.result[0].region,
          }
          this.setState({ address: address })
          console.log(address);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  addMinutes = (timeString, minutes) => {
    let time = moment(timeString, 'hh:mm a')
    if (minutes) {
      time.add(minutes, 'minutes')
    }
    return time.format('LT')
  }

  roundUpTime = (timeString) => {
    let t = moment(timeString, 'hh:mm:ss a')
    let roundUpTime = t.second() || t.millisecond() ? t.add(1, 'minute').startOf('minute') : t.startOf('minute')
    return roundUpTime.format('LT')
  }

  getAstronomyInfo = () => {
    // https://api.sunrise-sunset.org/json?lat=53.4908&lng=-2.3205
    // https://api.sunrise-sunset.org/json?lat=${this.state.coords.latitude}&lng=${this.state.coords.longitude}
    fetch(`https://api.sunrise-sunset.org/json?lat=53.4908&lng=-2.3205`)
      .then((response) => response.json())
      .then((responseJson) => {
        let sunsetTime = this.roundUpTime(responseJson.results.sunset)
        const astronomyData = {
          nautical_twilight_begin: this.roundUpTime(responseJson.results.nautical_twilight_begin),
          sunrise: this.roundUpTime(responseJson.results.sunrise),
          solar_noon: this.roundUpTime(responseJson.results.solar_noon),
          sunset: sunsetTime,
          magreb: this.addMinutes(sunsetTime, 20)
          // midnight: this.roundUpTime(responseJson.results.midnight)
        }
        this.setState({
          isLoading: false,
          astronomyData: astronomyData,
        });
        console.log(astronomyData)
      })
      .catch((error) => {
        console.error(error);
      });
  }

  getCurrentLoction = () => {
    Geolocation.getCurrentPosition(
      position => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }

        console.log(coords)

        this.setState({ coords: coords });
      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }

  render() {
    let Location
    if (this.state.coords) {
      Location = <Text>
        Coords{"\n"}
        Latitude: {this.state.coords.latitude}{"\n"}
        Longitude: {this.state.coords.longitude}{"\n"}
      </Text>
    }
    let Times
    if (!this.state.isLoading) {
      Times = <Text>
        Times{"\n"}
        Fajer: {this.state.astronomyData.nautical_twilight_begin}{"\n"}
        Sunrise: {this.state.astronomyData.sunrise}{"\n"}
        Zoher: {this.state.astronomyData.solar_noon}{"\n"}
        Sunset: {this.state.astronomyData.sunset}{"\n"}
        Magreb: {this.state.astronomyData.magreb}{"\n"}
      </Text>
    }
    let Address
    if (this.state.address) {
      Address = <Text>
        Approximate Location Info{"\n"}
        PostCode: {this.state.address.postcode}{"\n"}
        City: {this.state.address.city}{"\n"}
        Country: {this.state.address.country}{"\n"}
        Region: {this.state.address.region}{"\n"}
      </Text>
    }
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to Prayer Times Prototype</Text>
        {Location}
        {Times}
        {Address}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F4157',
  },
  welcome: {
    fontSize: 20,
    // textAlign: 'center',
    // margin: 10,
    color: 'white'
  },
  instructions: {
    // textAlign: 'center',
    color: '#CCCECF',
    // marginBottom: 5,
  },
});
