import React, { Component } from "react";
import "./customers.css";
import Moment from "moment";

class Customers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customers: [],
    };
  }

  componentDidMount() {
    fetch("/users/")
      .then((res) => res.json())
      .then((customers) => this.setState({ customers }));
  }
  render() {
    Moment.locale("fr");
    return (
      <div className="customers">
        <h2>Customers</h2>
        <ul>
          {this.state.customers.map((customer) => (
            <li key={customer.id}>
              {customer.login} {customer.email} {Moment(customer.date).format("DD/MM/YYYY")}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Customers;
