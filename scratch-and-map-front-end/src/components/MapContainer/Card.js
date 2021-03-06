import React, { Component } from "react";
import { returnCode, returnId } from "../helper";
import {
  Button,
  Header,
  Image,
  Modal,
  Form,
  TextArea,
  Icon
} from "semantic-ui-react";
import CardSlider from "./CardSlider";
import { codeToCountry, restCountryConversion, reverseCountryConversion, countries } from "../helper";
import "../../styles/card.scss";
import axios from "axios";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

class Card extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageUrl: "",
      countryName: "",
      status: 1,
      notes: "",
      currency: "",
      symbol: "",
      capital: "",
      language: "",
      users: [],
      traveler: [],
      modalOpen: true
    };
  }

  friendsTravel(){
    if (this.state.traveler.length !== 0) {
      return " Yes"
    } else {
      return " No"
    }
  }

  componentDidMount() {
    let code = restCountryConversion(this.props.country_code);
    let codename = this.props.country_code;
    fetch(`https://restcountries.eu/rest/v2/alpha/${code}`).then(response =>
      response
        .json()
        .then(data => ({
          data: data,
          status: response.status
        }))
        .then(res => {
          let countrySelect = codeToCountry(codename);
          let currency = res.data.currencies[0].name.toProperCase();
          let symbol = res.data.currencies[0].symbol;
          let cardCode = res.data.flag;
          let language = res.data.languages[0].name;
          let capital = res.data.capital;
          if (currency === "[E]" || currency === "[D]") {
            currency = "United States Dollar";
          }
          this.setState({
            imageUrl: cardCode,
            countryName: countrySelect,
            currency: currency,
            symbol: symbol,
            language: language,
            capital: capital
          });
        })
    );

    axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/users`)
            .then(res => {
              this.setState({ users: res.data.users });
            });

            let i = reverseCountryConversion(this.props.country_code);
            let index = countries.indexOf(i)+2;

            axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/countries/${index}`)
            .then(res => {
              this.setState({ traveler: res.data.travelers });
            });
  }

  handleClose(){
    this.setState({ modalOpen: false })
  }  


  onSave() {
    axios
      .get(
        `${
          process.env.REACT_APP_BACKEND_URL
        }/api/users/fb/${window.localStorage.getItem("SAMUserID")}`
      )
      .then(res => {
        const countryData = {
          user_id: res.data.id,
          country_id: returnId(this.props.country_code),
          status: this.state.status,
          notes: "None"
        };
        let country = res.data.user_countries.filter(item => {
          return item.country_id === returnId(this.props.country_code);
        });
        console.log(
          "AFTER FILTER",
          this.props.country_code,
          "FUNCTION:",
          returnId(this.props.country_code)
        );
        if (country.length == 0) {
          axios
            .post(
              `${process.env.REACT_APP_BACKEND_URL}/api/mapview`,
              countryData
            )
            .then(res => {
              this.props.cardSaveHandler(this.props.currentUser);
            });
        } else {
          axios
            .put(
              `${process.env.REACT_APP_BACKEND_URL}/api/mapview/${
                countryData.user_id
              }/${countryData.country_id}`,
              countryData
            )
            .then(res => {
              this.props.cardSaveHandler(this.props.currentUser);
            });
        }
      });
      this.handleClose()
  }

  onChange = status => {
    this.setState(
      state => ({
        status: parseInt(status, 10)
      }),
      () => {
        console.log(this.state);
      }
    );
  };

  render() {
    const friends = [
      { id: 9, first_name: "Abi", last_name: "French" },
      { id: 1, first_name: "Javier", last_name: "English" },
      { id: 2, first_name: "Ryan", last_name: "Adams" },
      { id: 3, first_name: "Bull", last_name: "Moll" },
      { id: 4, first_name: "Courtney", last_name: "B Vance" }
    ];

    const cardStyle = {
      zIndex: 11,
      border: "1px solid steelblue"
    };

    const modalStyle = {
      width: "40%"
    };

    let friendList = friends.map(friend => (
      <div key={friend.id}>
        {" "}
        <p>
          {friend.first_name} {friend.last_name}
        </p>
      </div>
    ));

 

    return (
      <div style={cardStyle}>
        <Modal style={modalStyle} className="modalStyle" open={this.state.modalOpen} onClose={this.handleClose} >
          <Modal.Content
            image
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Header
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <h1>{this.state.countryName} </h1>{" "}
              <Icon name="window close" onClick={() => this.props.onClose()} />{" "}
            </Header>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
                margin: "10px 10px 30px 10px"
              }}
            >
              <div>
                <img
                  style={{
                    border: "1px solid black",
                    height: "10vw",
                    marginBottom: "20px"
                  }}
                  src={this.state.imageUrl}
                />
              </div>
              <div style={{ width: "40%", height: "30px", marginLeft: "15px" }}>
                <h4>CAPITAL:  {this.state.capital}</h4>
                <h4>LANGUAGE:  {this.state.language}</h4>
                <h4>
                  CURRENCY:  {this.state.currency} ({this.state.symbol}){" "}
                </h4>
              </div>
            </div>

            <CardSlider status={this.state.status} onChange={this.onChange} />
            <Modal.Description>
              <strong>Notes:</strong>
              {
                <Form>
                  <TextArea
                    style={{ marginBottom: "10px" }}
                    placeholder="Travel Notes"
                  />
                </Form>
              }
              {/* <div>Friends Have Status Here: 
                {this.friendsTravel()}
              </div> */}
              <Button onClick={() => this.onSave()}>Save</Button>
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

export default withRouter(connect(() => {})(Card));
